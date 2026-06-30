import { Request, Response } from 'express';
import crypto from 'crypto';
import { applications } from '../utils/mockDb';
import { keyauthDecrypt, keyauthEncrypt, hexDecode, hexEncode, parseFormBody, buildResponse } from '../utils/keyauthCrypto';
import { generateUniqueId, hashPassword, comparePassword, generateLicenseKey } from '../utils/utils';
import { App } from '../models/App';
import { LicenseModel } from '../models/MongoLicense';
import { MongoUser } from '../models/MongoUser';
import { MongoToken } from '../models/MongoToken';
import { MongoVariable } from '../models/MongoVariable';
import { MongoLog } from '../models/MongoLog';
import { MongoSession } from '../models/MongoSession';

const protocolSessions: Record<string, { enckey: string; appId: string; name: string; ownerid: string }> = {};

export const handleKeyAuthRequest = async (req: Request, res: Response) => {
  try {
    const rawBody = req.body;
    let params: Record<string, string>;

    if (typeof rawBody === 'object' && rawBody !== null && !Buffer.isBuffer(rawBody)) {
      params = rawBody as Record<string, string>;
    } else {
      const bodyStr = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : String(rawBody);
      params = parseFormBody(bodyStr);
    }

    const typeHex = params['type'];
    const initIv = params['init_iv'];
    const nameHex = params['name'];
    const owneridHex = params['ownerid'];

    if (!typeHex || !initIv) {
      res.setHeader('Content-Type', 'text/plain');
      return res.send('');
    }

    const type = hexDecode(typeHex);
    const name = nameHex ? hexDecode(nameHex) : '';
    const ownerid = owneridHex ? hexDecode(owneridHex) : '';

    let app = applications.find(a => a.ownerId === ownerid);
    if (!app) {
      const mongoApp = await App.findOne({ ownerId: ownerid });
      if (mongoApp) {
        app = {
          id: generateUniqueId(),
          name: mongoApp.name,
          version: mongoApp.version,
          status: (mongoApp.status as 'Active' | 'Paused') || 'Active',
          ownerId: mongoApp.ownerId,
          secret: mongoApp.secret,
        };
        applications.push(app);
      }
    }
    if (!app) {
      res.setHeader('Content-Type', 'text/plain');
      return res.send('');
    }

    switch (type) {
      case 'init': return handleInit(app, params, initIv, res);
      case 'login': return handleLogin(app, params, initIv, res);
      case 'register': return handleRegister(app, params, initIv, res);
      case 'upgrade': return handleUpgrade(app, params, initIv, res);
      case 'license': return handleLicense(app, params, initIv, res);
      case 'ban': return handleBan(app, params, initIv, res);
      case 'var': return handleVar(app, params, initIv, res);
      case 'log': return handleLog(app, params, initIv, res);
      case 'file': return handleFile(app, params, initIv, res);
      case 'webhook': return handleWebhook(app, params, initIv, res);
      default:
        return res.status(400).json({ success: false, message: `Unknown type: ${type}` });
    }
  } catch (err: any) {
    console.error('KeyAuth protocol error:', err);
    res.setHeader('Content-Type', 'text/plain');
    return res.send('');
  }
};

function handleInit(app: any, params: Record<string, string>, initIv: string, res: Response) {
  const secret = app.secret;
  const version = keyauthDecrypt(params['ver'] || '', secret, initIv);
  const enckey = keyauthDecrypt(params['enckey'] || '', secret, initIv);
  const sessionId = generateUniqueId();

  protocolSessions[sessionId] = { enckey, appId: app.id, name: app.name, ownerid: app.ownerId };

  const response = buildResponse({ success: true, sessionid: sessionId }, secret, initIv);
  res.setHeader('Content-Type', 'text/plain');
  res.send(response);
}

async function handleLogin(app: any, params: Record<string, string>, initIv: string, res: Response) {
  const session = getSession(params, app);
  if (!session) return sendError(res, 'Invalid session', initIv, app.secret);

  const enckey = session.enckey;
  const username = keyauthDecrypt(params['username'] || '', enckey, initIv);
  const password = keyauthDecrypt(params['pass'] || '', enckey, initIv);
  const hwid = keyauthDecrypt(params['hwid'] || '', enckey, initIv);

  const user = await MongoUser.findOne({ username, appId: app.ownerId });
  if (!user) return sendError(res, 'User not found', enckey, initIv);

  const passwordValid = comparePasswordSync(password, user.password);
  if (!passwordValid) return sendError(res, 'Invalid credentials', enckey, initIv);

  if (user.hwid && user.hwid !== hwid) {
    return sendError(res, 'Hardware Mismatch', enckey, initIv);
  }

  if (!user.hwid) { user.hwid = hwid; }
  user.lastLogin = new Date();
  user.ip = 'local';
  await user.save();

  const newToken = await MongoToken.create({
    token: generateUniqueId(),
    userId: (user._id as any).toString(),
    appId: app.ownerId,
    status: 'Active',
  });

  const expiryTimestamp = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60;

  const response = buildResponse({
    success: true,
    info: {
      username: user.username,
      subscriptions: [{ subscription: 'default', expiry: String(expiryTimestamp) }],
    },
  }, enckey, initIv);

  res.setHeader('Content-Type', 'text/plain');
  res.send(response);
}

async function handleRegister(app: any, params: Record<string, string>, initIv: string, res: Response) {
  const session = getSession(params, app);
  if (!session) return sendError(res, 'Invalid session', initIv, app.secret);

  const enckey = session.enckey;
  const username = keyauthDecrypt(params['username'] || '', enckey, initIv);
  const password = keyauthDecrypt(params['pass'] || '', enckey, initIv);
  const licenseKey = keyauthDecrypt(params['key'] || '', enckey, initIv);
  const hwid = keyauthDecrypt(params['hwid'] || '', enckey, initIv);

  const license = await LicenseModel.findOne({ key: licenseKey, appId: app.ownerId });
  if (!license) return sendError(res, 'License not found', enckey, initIv);
  if (license.status === 'Used') return sendError(res, 'License already used', enckey, initIv);

  const existingUser = await MongoUser.findOne({ username, appId: app.ownerId });
  if (existingUser) return sendError(res, 'User already exists', enckey, initIv);

  license.status = 'Used';
  license.hwid = hwid;
  await license.save();

  const hashedPassword = hashPasswordSync(password);
  const newUser = await MongoUser.create({
    username,
    password: hashedPassword,
    hwid,
    ip: 'local',
    lastLogin: new Date(),
    status: 'Active',
    appId: app.ownerId,
  });

  const expiryTimestamp = Math.floor(Date.now() / 1000) + license.durationDays * 24 * 60 * 60;

  const response = buildResponse({
    success: true,
    info: {
      username: newUser.username,
      subscriptions: [{ subscription: 'default', expiry: String(expiryTimestamp) }],
    },
  }, enckey, initIv);

  res.setHeader('Content-Type', 'text/plain');
  res.send(response);
}

async function handleUpgrade(app: any, params: Record<string, string>, initIv: string, res: Response) {
  const session = getSession(params, app);
  if (!session) return sendError(res, 'Invalid session', initIv, app.secret);

  const enckey = session.enckey;
  const username = keyauthDecrypt(params['username'] || '', enckey, initIv);
  const licenseKey = keyauthDecrypt(params['key'] || '', enckey, initIv);

  const license = await LicenseModel.findOne({ key: licenseKey, appId: app.ownerId });
  if (!license) return sendError(res, 'License not found', enckey, initIv);
  if (license.status === 'Used') return sendError(res, 'License already used', enckey, initIv);

  const user = await MongoUser.findOne({ username, appId: app.ownerId });
  if (!user) return sendError(res, 'User not found', enckey, initIv);

  license.status = 'Used';
  await license.save();

  const response = buildResponse({ success: true, message: 'Upgrade successful' }, enckey, initIv);
  res.setHeader('Content-Type', 'text/plain');
  res.send(response);
}

async function handleLicense(app: any, params: Record<string, string>, initIv: string, res: Response) {
  const session = getSession(params, app);
  if (!session) return sendError(res, 'Invalid session', initIv, app.secret);

  const enckey = session.enckey;
  const licenseKey = keyauthDecrypt(params['key'] || '', enckey, initIv);

  const license = await LicenseModel.findOne({ key: licenseKey, appId: app.ownerId });
  if (!license) return sendError(res, 'License not found', enckey, initIv);

  const expiryTimestamp = Math.floor(new Date(license.expiresAt).getTime() / 1000);

  const response = buildResponse({
    success: true,
    info: {
      username: 'license-user',
      subscriptions: [{ subscription: 'default', expiry: String(expiryTimestamp) }],
    },
  }, enckey, initIv);

  res.setHeader('Content-Type', 'text/plain');
  res.send(response);
}

async function handleBan(app: any, params: Record<string, string>, initIv: string, res: Response) {
  const session = getSession(params, app);
  if (!session) return sendError(res, 'Invalid session', initIv, app.secret);

  const enckey = session.enckey;
  const token = await MongoToken.findOne({ appId: app.ownerId, status: 'Active' });
  if (token) {
    await MongoUser.findOneAndUpdate({ _id: token.userId }, { status: 'Banned' });
  }

  const response = buildResponse({ success: true, message: 'User banned' }, enckey, initIv);
  res.setHeader('Content-Type', 'text/plain');
  res.send(response);
}

async function handleVar(app: any, params: Record<string, string>, initIv: string, res: Response) {
  const session = getSession(params, app);
  if (!session) return sendError(res, 'Invalid session', initIv, app.secret);

  const enckey = session.enckey;
  const varId = keyauthDecrypt(params['varid'] || '', enckey, initIv);

  const varEntry = await MongoVariable.findOne({ appId: app.ownerId, name: varId });
  const value = varEntry ? varEntry.value : '';

  const response = buildResponse({ success: true, message: value }, enckey, initIv);
  res.setHeader('Content-Type', 'text/plain');
  res.send(response);
}

async function handleLog(app: any, params: Record<string, string>, initIv: string, res: Response) {
  const session = getSession(params, app);
  if (!session) return sendError(res, 'Invalid session', initIv, app.secret);

  const enckey = session.enckey;
  const pcuser = keyauthDecrypt(params['pcuser'] || '', enckey, initIv);
  const message = keyauthDecrypt(params['message'] || '', enckey, initIv);

  await MongoLog.create({ timestamp: new Date(), pcuser, message, appId: app.ownerId });

  const response = buildResponse({ success: true }, enckey, initIv);
  res.setHeader('Content-Type', 'text/plain');
  res.send(response);
}

function handleFile(app: any, params: Record<string, string>, initIv: string, res: Response) {
  const session = getSession(params, app);
  if (!session) return sendError(res, 'Invalid session', initIv, app.secret);

  const enckey = session.enckey;
  const response = buildResponse({ success: true, contents: hexEncode('') }, enckey, initIv);
  res.setHeader('Content-Type', 'text/plain');
  res.send(response);
}

function handleWebhook(app: any, params: Record<string, string>, initIv: string, res: Response) {
  const session = getSession(params, app);
  if (!session) return sendError(res, 'Invalid session', initIv, app.secret);

  const enckey = session.enckey;
  const response = buildResponse({ success: true, message: 'Webhook executed' }, enckey, initIv);
  res.setHeader('Content-Type', 'text/plain');
  res.send(response);
}

function getSession(params: Record<string, string>, app: any) {
  const sessionId = hexDecode(params['sessionid'] || '');
  const session = protocolSessions[sessionId];
  if (!session || session.ownerid !== app.ownerId) return null;
  return session;
}

function sendError(res: Response, message: string, encKey: string, initIv: string) {
  const response = buildResponse({ success: false, message }, encKey, initIv);
  res.setHeader('Content-Type', 'text/plain');
  res.send(response);
}

function hashPasswordSync(password: string): string {
  const bcryptjs = require('bcryptjs');
  return bcryptjs.hashSync(password, 10);
}

function comparePasswordSync(password: string, hash: string): boolean {
  const bcryptjs = require('bcryptjs');
  return bcryptjs.compareSync(password, hash);
}

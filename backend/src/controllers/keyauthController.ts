import { Request, Response } from 'express';
import crypto from 'crypto';
import { applications, licenses, users, tokens, subscriptions } from '../utils/mockDb';
import { keyauthDecrypt, keyauthEncrypt, hexDecode, hexEncode, parseFormBody, buildResponse } from '../utils/keyauthCrypto';
import { generateUniqueId, hashPassword, comparePassword, generateLicenseKey } from '../utils/utils';
import { User, Token, Subscription } from '../models';

// In-memory session store: sessionId -> { enckey, appId, name, ownerid }
const sessions: Record<string, { enckey: string; appId: string; name: string; ownerid: string }> = {};

// In-memory variable store: varId -> value (per app)
const variables: Record<string, Record<string, string>> = {};

// In-memory log store
const logs: Array<{ timestamp: string; pcuser: string; message: string; appId: string }> = [];

// In-memory webhook store
const webhooks: Record<string, Record<string, string>> = {};

export const handleKeyAuthRequest = async (req: Request, res: Response) => {
  try {
    // The C++ SDK sends form-encoded POST body
    // express.urlencoded() may parse it into an object, or it may be raw text
    const rawBody = req.body;
    let params: Record<string, string>;

    if (typeof rawBody === 'object' && rawBody !== null && !Buffer.isBuffer(rawBody)) {
      // Already parsed by express.urlencoded()
      params = rawBody as Record<string, string>;
    } else {
      // Raw text body
      const bodyStr = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : String(rawBody);
      params = parseFormBody(bodyStr);
    }

    const typeHex = params['type'];
    const initIv = params['init_iv'];
    const nameHex = params['name'];
    const owneridHex = params['ownerid'];

    if (!typeHex || !initIv) {
      return res.status(400).json({ success: false, message: 'Missing type or init_iv' });
    }

    const type = hexDecode(typeHex);
    const name = nameHex ? hexDecode(nameHex) : '';
    const ownerid = owneridHex ? hexDecode(owneridHex) : '';

    // Find the application
    const app = applications.find(a => a.name === name && a.ownerId === ownerid);
    if (!app) {
      return res.status(400).json({ success: false, message: 'Invalid application credentials' });
    }

    // Route to handler based on type
    switch (type) {
      case 'init':
        return handleInit(app, params, initIv, res);
      case 'login':
        return handleLogin(app, params, initIv, res);
      case 'register':
        return handleRegister(app, params, initIv, res);
      case 'upgrade':
        return handleUpgrade(app, params, initIv, res);
      case 'license':
        return handleLicense(app, params, initIv, res);
      case 'ban':
        return handleBan(app, params, initIv, res);
      case 'var':
        return handleVar(app, params, initIv, res);
      case 'log':
        return handleLog(app, params, initIv, res);
      case 'file':
        return handleFile(app, params, initIv, res);
      case 'webhook':
        return handleWebhook(app, params, initIv, res);
      default:
        return res.status(400).json({ success: false, message: `Unknown type: ${type}` });
    }
  } catch (err: any) {
    console.error('KeyAuth protocol error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// ─── INIT ───────────────────────────────────────────────────────
// Client encrypts with secret, sends enckey encrypted
// Server decrypts with secret, stores enckey for session
function handleInit(app: any, params: Record<string, string>, initIv: string, res: Response) {
  const secret = app.secret;

  // Decrypt fields encrypted with secret
  const version = keyauthDecrypt(params['ver'] || '', secret, initIv);
  const enckey = keyauthDecrypt(params['enckey'] || '', secret, initIv);

  // Generate session ID
  const sessionId = generateUniqueId();

  // Store session with the enckey
  sessions[sessionId] = {
    enckey,
    appId: app.id,
    name: app.name,
    ownerid: app.ownerId,
  };

  // Init variable store for this app
  if (!variables[app.id]) {
    variables[app.id] = {};
  }

  // Response encrypted with secret (same key/iv as client used)
  const response = buildResponse(
    { success: true, sessionid: sessionId },
    secret,
    initIv
  );

  res.setHeader('Content-Type', 'text/plain');
  res.send(response);
}

// ─── LOGIN ──────────────────────────────────────────────────────
function handleLogin(app: any, params: Record<string, string>, initIv: string, res: Response) {
  const session = getSession(params, app);
  if (!session) return sendError(res, 'Invalid session', initIv, app.secret);

  const enckey = session.enckey;

  const username = keyauthDecrypt(params['username'] || '', enckey, initIv);
  const password = keyauthDecrypt(params['pass'] || '', enckey, initIv);
  const hwid = keyauthDecrypt(params['hwid'] || '', enckey, initIv);
  const sessionId = hexDecode(params['sessionid'] || '');

  const user = users.find(u => u.username === username && u.appId === app.id);
  if (!user) return sendError(res, 'User not found', enckey, initIv);

  const passwordValid = comparePasswordSync(password, user.password);
  if (!passwordValid) return sendError(res, 'Invalid credentials', enckey, initIv);

  // Allow first login (hwid = null) or match existing hwid
  if (user.hwid && user.hwid !== hwid) {
    return sendError(res, 'Hardware Mismatch', enckey, initIv);
  }

  // Lock HWID on first login
  if (!user.hwid) {
    user.hwid = hwid;
  }

  user.lastLogin = new Date();
  user.ip = 'local';

  // Generate token
  const newToken: Token = {
    id: generateUniqueId(),
    token: generateUniqueId(),
    userId: user.id,
    appId: app.id,
    status: 'Active',
  };
  tokens.push(newToken);

  const expiryTimestamp = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days from now

  const response = buildResponse({
    success: true,
    info: {
      username: user.username,
      subscriptions: [
        {
          subscription: 'default',
          expiry: String(expiryTimestamp),
        },
      ],
    },
  }, enckey, initIv);

  res.setHeader('Content-Type', 'text/plain');
  res.send(response);
}

// ─── REGISTER ───────────────────────────────────────────────────
function handleRegister(app: any, params: Record<string, string>, initIv: string, res: Response) {
  const session = getSession(params, app);
  if (!session) return sendError(res, 'Invalid session', initIv, app.secret);

  const enckey = session.enckey;

  const username = keyauthDecrypt(params['username'] || '', enckey, initIv);
  const password = keyauthDecrypt(params['pass'] || '', enckey, initIv);
  const licenseKey = keyauthDecrypt(params['key'] || '', enckey, initIv);
  const hwid = keyauthDecrypt(params['hwid'] || '', enckey, initIv);

  // Validate license key
  const license = licenses.find(l => l.key === licenseKey && l.appId === app.id);
  if (!license) return sendError(res, 'License not found', enckey, initIv);
  if (license.status === 'Used') return sendError(res, 'License already used', enckey, initIv);

  // Check if user already exists
  const existingUser = users.find(u => u.username === username && u.appId === app.id);
  if (existingUser) return sendError(res, 'User already exists', enckey, initIv);

  // Mark license as used
  license.status = 'Used';
  license.hwid = hwid;

  // Create user
  const hashedPassword = hashPasswordSync(password);
  const newUser: User = {
    id: generateUniqueId(),
    username,
    password: hashedPassword,
    hwid,
    ip: 'local',
    lastLogin: new Date(),
    status: 'Active',
    appId: app.id,
  };
  users.push(newUser);

  const expiryTimestamp = Math.floor(Date.now() / 1000) + license.durationDays * 24 * 60 * 60;

  const response = buildResponse({
    success: true,
    info: {
      username: newUser.username,
      subscriptions: [
        {
          subscription: 'default',
          expiry: String(expiryTimestamp),
        },
      ],
    },
  }, enckey, initIv);

  res.setHeader('Content-Type', 'text/plain');
  res.send(response);
}

// ─── UPGRADE ────────────────────────────────────────────────────
function handleUpgrade(app: any, params: Record<string, string>, initIv: string, res: Response) {
  const session = getSession(params, app);
  if (!session) return sendError(res, 'Invalid session', initIv, app.secret);

  const enckey = session.enckey;

  const username = keyauthDecrypt(params['username'] || '', enckey, initIv);
  const licenseKey = keyauthDecrypt(params['key'] || '', enckey, initIv);

  const license = licenses.find(l => l.key === licenseKey && l.appId === app.id);
  if (!license) return sendError(res, 'License not found', enckey, initIv);
  if (license.status === 'Used') return sendError(res, 'License already used', enckey, initIv);

  const user = users.find(u => u.username === username && u.appId === app.id);
  if (!user) return sendError(res, 'User not found', enckey, initIv);

  license.status = 'Used';

  const response = buildResponse({
    success: true,
    message: 'Upgrade successful',
  }, enckey, initIv);

  res.setHeader('Content-Type', 'text/plain');
  res.send(response);
}

// ─── LICENSE ────────────────────────────────────────────────────
function handleLicense(app: any, params: Record<string, string>, initIv: string, res: Response) {
  const session = getSession(params, app);
  if (!session) return sendError(res, 'Invalid session', initIv, app.secret);

  const enckey = session.enckey;

  const licenseKey = keyauthDecrypt(params['key'] || '', enckey, initIv);
  const hwid = keyauthDecrypt(params['hwid'] || '', enckey, initIv);

  const license = licenses.find(l => l.key === licenseKey && l.appId === app.id);
  if (!license) return sendError(res, 'License not found', enckey, initIv);

  const expiryTimestamp = Math.floor(new Date(license.expiresAt).getTime() / 1000);

  const response = buildResponse({
    success: true,
    info: {
      username: 'license-user',
      subscriptions: [
        {
          subscription: 'default',
          expiry: String(expiryTimestamp),
        },
      ],
    },
  }, enckey, initIv);

  res.setHeader('Content-Type', 'text/plain');
  res.send(response);
}

// ─── BAN ────────────────────────────────────────────────────────
function handleBan(app: any, params: Record<string, string>, initIv: string, res: Response) {
  const session = getSession(params, app);
  if (!session) return sendError(res, 'Invalid session', initIv, app.secret);

  const enckey = session.enckey;

  // Find user from session and ban them
  const token = tokens.find(t => t.appId === app.id && t.status === 'Active');
  if (token) {
    const user = users.find(u => u.id === token.userId);
    if (user) {
      user.status = 'Banned';
    }
  }

  const response = buildResponse({
    success: true,
    message: 'User banned',
  }, enckey, initIv);

  res.setHeader('Content-Type', 'text/plain');
  res.send(response);
}

// ─── VAR ────────────────────────────────────────────────────────
function handleVar(app: any, params: Record<string, string>, initIv: string, res: Response) {
  const session = getSession(params, app);
  if (!session) return sendError(res, 'Invalid session', initIv, app.secret);

  const enckey = session.enckey;
  const varId = keyauthDecrypt(params['varid'] || '', enckey, initIv);

  const value = variables[app.id]?.[varId] || '';

  const response = buildResponse({
    success: true,
    message: value,
  }, enckey, initIv);

  res.setHeader('Content-Type', 'text/plain');
  res.send(response);
}

// ─── LOG ────────────────────────────────────────────────────────
function handleLog(app: any, params: Record<string, string>, initIv: string, res: Response) {
  const session = getSession(params, app);
  if (!session) return sendError(res, 'Invalid session', initIv, app.secret);

  const enckey = session.enckey;

  const pcuser = keyauthDecrypt(params['pcuser'] || '', enckey, initIv);
  const message = keyauthDecrypt(params['message'] || '', enckey, initIv);

  logs.push({
    timestamp: new Date().toISOString(),
    pcuser,
    message,
    appId: app.id,
  });

  const response = buildResponse({
    success: true,
  }, enckey, initIv);

  res.setHeader('Content-Type', 'text/plain');
  res.send(response);
}

// ─── FILE (download) ────────────────────────────────────────────
function handleFile(app: any, params: Record<string, string>, initIv: string, res: Response) {
  const session = getSession(params, app);
  if (!session) return sendError(res, 'Invalid session', initIv, app.secret);

  const enckey = session.enckey;
  const fileId = keyauthDecrypt(params['fileid'] || '', enckey, initIv);

  // Placeholder: return empty file
  const response = buildResponse({
    success: true,
    contents: hexEncode(''),
  }, enckey, initIv);

  res.setHeader('Content-Type', 'text/plain');
  res.send(response);
}

// ─── WEBHOOK ────────────────────────────────────────────────────
function handleWebhook(app: any, params: Record<string, string>, initIv: string, res: Response) {
  const session = getSession(params, app);
  if (!session) return sendError(res, 'Invalid session', initIv, app.secret);

  const enckey = session.enckey;

  const webId = keyauthDecrypt(params['webid'] || '', enckey, initIv);
  const webhookParams = keyauthDecrypt(params['params'] || '', enckey, initIv);

  const response = buildResponse({
    success: true,
    message: 'Webhook executed',
  }, enckey, initIv);

  res.setHeader('Content-Type', 'text/plain');
  res.send(response);
}

// ─── HELPERS ────────────────────────────────────────────────────
function getSession(params: Record<string, string>, app: any) {
  const sessionId = hexDecode(params['sessionid'] || '');
  const session = sessions[sessionId];
  if (!session || session.appId !== app.id) return null;
  return session;
}

function sendError(res: Response, message: string, encKey: string, initIv: string) {
  const response = buildResponse({
    success: false,
    message,
  }, encKey, initIv);

  res.setHeader('Content-Type', 'text/plain');
  res.send(response);
}

// Sync bcrypt helpers (the C++ client expects synchronous responses)
function hashPasswordSync(password: string): string {
  const bcryptjs = require('bcryptjs');
  return bcryptjs.hashSync(password, 10);
}

function comparePasswordSync(password: string, hash: string): boolean {
  const bcryptjs = require('bcryptjs');
  return bcryptjs.compareSync(password, hash);
}

// Export sessions for debugging
export function getSessions() {
  return sessions;
}

export function getVariables() {
  return variables;
}

export function getLogs() {
  return logs;
}

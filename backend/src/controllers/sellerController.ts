import { Request, Response } from 'express';
import { generateUniqueId, generateLicenseKey } from '../utils/utils';
import { App } from '../models/App';
import { LicenseModel } from '../models/MongoLicense';
import { MongoUser } from '../models/MongoUser';
import { MongoToken } from '../models/MongoToken';
import { MongoSubscription } from '../models/MongoSubscription';
import { MongoLog } from '../models/MongoLog';
import { MongoWebhook } from '../models/MongoWebhook';
import { MongoVariable } from '../models/MongoVariable';
import { MongoSession } from '../models/MongoSession';
import { Application } from '../models';

interface AuthRequest extends Request {
  authApp?: Application;
}

export const getApps = async (req: Request, res: Response) => {
  const app = (req as AuthRequest).authApp;
  if (!app) return res.status(401).json({ message: 'Application not authenticated.' });
  try {
    const mongoApps = await App.find({}).select('-__v -createdBy -createdAt').lean();
    res.status(200).json(mongoApps.map(ma => ({
      id: (ma._id as any).toString(),
      name: ma.name,
      version: ma.version,
      status: ma.status,
      ownerId: ma.ownerId,
      secret: ma.secret,
    })));
  } catch (err: any) {
    res.status(500).json({ message: 'Failed to fetch apps.' });
  }
};

export const createApp = async (req: Request, res: Response) => {
  const { name, version, ownerId, secret } = req.body;
  if (!name || !version) {
    return res.status(400).json({ message: 'Missing required fields: name and version.' });
  }
  const finalOwnerId = ownerId || generateUniqueId();
  const finalSecret = secret || generateUniqueId() + generateUniqueId();

  try {
    const existing = await App.findOne({ ownerId: finalOwnerId });
    if (existing) return res.status(409).json({ message: 'Application already exists.' });

    const mongoApp = await App.create({ name, ownerId: finalOwnerId, secret: finalSecret, version, status: 'Active' });
    res.status(201).json({ message: 'Application created.', app: {
      id: (mongoApp._id as any).toString(),
      name: mongoApp.name,
      version: mongoApp.version,
      status: mongoApp.status,
      ownerId: mongoApp.ownerId,
      secret: mongoApp.secret,
    }});
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const updateApp = async (req: Request, res: Response) => {
  const app = (req as AuthRequest).authApp;
  if (!app) return res.status(401).json({ message: 'Application not authenticated.' });

  const { name, version, status } = req.body;
  try {
    const updated = await App.findOneAndUpdate(
      { ownerId: app.ownerId },
      { ...(name && { name }), ...(version && { version }), ...(status && { status }) },
      { new: true }
    ).select('-__v -createdBy -createdAt');
    if (!updated) return res.status(404).json({ message: 'App not found.' });
    res.status(200).json({ message: 'Application updated.', app: {
      id: (updated._id as any).toString(),
      name: updated.name,
      version: updated.version,
      status: updated.status,
      ownerId: updated.ownerId,
      secret: updated.secret,
    }});
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteApp = async (req: Request, res: Response) => {
  const app = (req as AuthRequest).authApp;
  if (!app) return res.status(401).json({ message: 'Application not authenticated.' });

  try {
    await App.findOneAndDelete({ ownerId: app.ownerId });
    res.status(200).json({ message: 'Application deleted.' });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const generateLicenses = async (req: AuthRequest, res: Response) => {
  const { count, durationDays, subLevel } = req.body;
  const app = req.authApp;
  if (!app) return res.status(401).json({ message: 'Application not authenticated.' });
  if (!count || !durationDays || !subLevel) {
    return res.status(400).json({ message: 'Missing required fields: count, durationDays, subLevel.' });
  }

  const generated = [];
  for (let i = 0; i < count; i++) {
    const newLicense = await LicenseModel.create({
      key: generateLicenseKey(),
      durationDays,
      status: 'Not Used',
      subLevel,
      hwid: null,
      expiresAt: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
      appId: app.ownerId,
    });
    generated.push({
      id: (newLicense._id as any).toString(),
      key: newLicense.key,
      durationDays: newLicense.durationDays,
      status: newLicense.status,
      subLevel: newLicense.subLevel,
      hwid: newLicense.hwid,
      expiresAt: newLicense.expiresAt,
      appId: newLicense.appId,
    });
  }
  res.status(201).json({ message: `${count} licenses generated.`, licenses: generated });
};

export const getLicenses = async (req: Request, res: Response) => {
  const app = (req as AuthRequest).authApp;
  if (!app) return res.status(401).json({ message: 'Application not authenticated.' });

  const appLicenses = await LicenseModel.find({ appId: app.ownerId }).lean();
  res.status(200).json({ licenses: appLicenses.map(l => ({
    id: (l._id as any).toString(),
    key: l.key,
    durationDays: l.durationDays,
    status: l.status,
    subLevel: l.subLevel,
    hwid: l.hwid,
    expiresAt: l.expiresAt,
    appId: l.appId,
  })) });
};

export const deleteLicense = async (req: Request, res: Response) => {
  const app = (req as AuthRequest).authApp;
  if (!app) return res.status(401).json({ message: 'Application not authenticated.' });

  const { id } = req.params;
  try {
    const deleted = await LicenseModel.findOneAndDelete({ _id: id, appId: app.ownerId });
    if (!deleted) return res.status(404).json({ message: 'License not found.' });
    res.status(200).json({ message: 'License deleted.' });
  } catch {
    res.status(404).json({ message: 'License not found.' });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  const app = (req as AuthRequest).authApp;
  if (!app) return res.status(401).json({ message: 'Application not authenticated.' });

  const appUsers = await MongoUser.find({ appId: app.ownerId }).lean();
  res.status(200).json({ users: appUsers.map(u => ({
    id: (u._id as any).toString(),
    username: u.username,
    ip: u.ip,
    lastLogin: u.lastLogin,
    hwid: u.hwid,
    status: u.status,
    appId: u.appId,
  })) });
};

export const banUser = async (req: Request, res: Response) => {
  const app = (req as AuthRequest).authApp;
  if (!app) return res.status(401).json({ message: 'Application not authenticated.' });

  const { id } = req.params;
  try {
    const user = await MongoUser.findOneAndUpdate({ _id: id, appId: app.ownerId }, { status: 'Banned' }, { new: true });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.status(200).json({ message: 'User banned.' });
  } catch {
    res.status(404).json({ message: 'User not found.' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const app = (req as AuthRequest).authApp;
  if (!app) return res.status(401).json({ message: 'Application not authenticated.' });

  const { id } = req.params;
  try {
    const deleted = await MongoUser.findOneAndDelete({ _id: id, appId: app.ownerId });
    if (!deleted) return res.status(404).json({ message: 'User not found.' });
    res.status(200).json({ message: 'User deleted.' });
  } catch {
    res.status(404).json({ message: 'User not found.' });
  }
};

export const getTokens = async (req: Request, res: Response) => {
  const app = (req as AuthRequest).authApp;
  if (!app) return res.status(401).json({ message: 'Application not authenticated.' });

  const appTokens = await MongoToken.find({ appId: app.ownerId }).lean();
  const enriched = await Promise.all(appTokens.map(async (t) => {
    const user = await MongoUser.findById(t.userId).lean();
    return {
      id: (t._id as any).toString(),
      token: t.token,
      status: t.status,
      username: user?.username || 'Unknown',
      appId: t.appId,
    };
  }));
  res.status(200).json(enriched);
};

export const revokeToken = async (req: Request, res: Response) => {
  const app = (req as AuthRequest).authApp;
  if (!app) return res.status(401).json({ message: 'Application not authenticated.' });

  const { id } = req.params;
  try {
    const token = await MongoToken.findOneAndUpdate({ _id: id, appId: app.ownerId }, { status: 'Banned' }, { new: true });
    if (!token) return res.status(404).json({ message: 'Token not found.' });
    res.status(200).json({ message: 'Token revoked.' });
  } catch {
    res.status(404).json({ message: 'Token not found.' });
  }
};

export const getSubscriptions = async (req: Request, res: Response) => {
  const app = (req as AuthRequest).authApp;
  if (!app) return res.status(401).json({ message: 'Application not authenticated.' });

  const appSubs = await MongoSubscription.find({ appId: app.ownerId }).lean();
  res.status(200).json(appSubs.map(s => ({
    id: (s._id as any).toString(),
    name: s.name,
    level: s.level,
    appId: s.appId,
  })));
};

export const createSubscription = async (req: Request, res: Response) => {
  const app = (req as AuthRequest).authApp;
  if (!app) return res.status(401).json({ message: 'Application not authenticated.' });

  const { name, level } = req.body;
  if (!name || level === undefined) {
    return res.status(400).json({ message: 'Missing required fields: name, level.' });
  }

  const newSub = await MongoSubscription.create({ name, level, appId: app.ownerId });
  res.status(201).json({ message: 'Subscription created.', subscription: {
    id: (newSub._id as any).toString(),
    name: newSub.name,
    level: newSub.level,
    appId: newSub.appId,
  }});
};

export const deleteSubscription = async (req: Request, res: Response) => {
  const app = (req as AuthRequest).authApp;
  if (!app) return res.status(401).json({ message: 'Application not authenticated.' });

  const { id } = req.params;
  try {
    const deleted = await MongoSubscription.findOneAndDelete({ _id: id, appId: app.ownerId });
    if (!deleted) return res.status(404).json({ message: 'Subscription not found.' });
    res.status(200).json({ message: 'Subscription deleted.' });
  } catch {
    res.status(404).json({ message: 'Subscription not found.' });
  }
};

export const getLogs = async (req: Request, res: Response) => {
  const app = (req as AuthRequest).authApp;
  if (!app) return res.status(401).json({ message: 'Application not authenticated.' });

  const appLogs = await MongoLog.find({ appId: app.ownerId }).sort({ timestamp: -1 }).lean();
  res.status(200).json(appLogs.map(l => ({
    id: (l._id as any).toString(),
    timestamp: l.timestamp,
    pcuser: l.pcuser,
    message: l.message,
    appId: l.appId,
  })));
};

export const deleteLogs = async (req: Request, res: Response) => {
  const app = (req as AuthRequest).authApp;
  if (!app) return res.status(401).json({ message: 'Application not authenticated.' });

  await MongoLog.deleteMany({ appId: app.ownerId });
  res.status(200).json({ message: 'Logs cleared.' });
};

export const getWebhooks = async (req: Request, res: Response) => {
  const app = (req as AuthRequest).authApp;
  if (!app) return res.status(401).json({ message: 'Application not authenticated.' });

  const appWebhooks = await MongoWebhook.find({ appId: app.ownerId }).lean();
  res.status(200).json(appWebhooks.map(w => ({
    id: (w._id as any).toString(),
    name: w.name,
    url: w.url,
    events: w.events,
    status: w.status,
    appId: w.appId,
  })));
};

export const createWebhook = async (req: Request, res: Response) => {
  const app = (req as AuthRequest).authApp;
  if (!app) return res.status(401).json({ message: 'Application not authenticated.' });

  const { name, url, events } = req.body;
  if (!name || !url) {
    return res.status(400).json({ message: 'Missing required fields: name, url.' });
  }

  const newWebhook = await MongoWebhook.create({ name, url, events: events || 'all', status: 'Active', appId: app.ownerId });
  res.status(201).json({ message: 'Webhook created.', webhook: {
    id: (newWebhook._id as any).toString(),
    name: newWebhook.name,
    url: newWebhook.url,
    events: newWebhook.events,
    status: newWebhook.status,
    appId: newWebhook.appId,
  }});
};

export const deleteWebhook = async (req: Request, res: Response) => {
  const app = (req as AuthRequest).authApp;
  if (!app) return res.status(401).json({ message: 'Application not authenticated.' });

  const { id } = req.params;
  try {
    const deleted = await MongoWebhook.findOneAndDelete({ _id: id, appId: app.ownerId });
    if (!deleted) return res.status(404).json({ message: 'Webhook not found.' });
    res.status(200).json({ message: 'Webhook deleted.' });
  } catch {
    res.status(404).json({ message: 'Webhook not found.' });
  }
};

export const getVariables = async (req: Request, res: Response) => {
  const app = (req as AuthRequest).authApp;
  if (!app) return res.status(401).json({ message: 'Application not authenticated.' });

  const appVars = await MongoVariable.find({ appId: app.ownerId }).lean();
  res.status(200).json(appVars.map(v => ({
    id: (v._id as any).toString(),
    name: v.name,
    value: v.value,
    appId: v.appId,
  })));
};

export const createVariable = async (req: Request, res: Response) => {
  const app = (req as AuthRequest).authApp;
  if (!app) return res.status(401).json({ message: 'Application not authenticated.' });

  const { name, value } = req.body;
  if (!name || value === undefined) {
    return res.status(400).json({ message: 'Missing required fields: name, value.' });
  }

  const newVar = await MongoVariable.create({ name, value, appId: app.ownerId });
  res.status(201).json({ message: 'Variable created.', variable: {
    id: (newVar._id as any).toString(),
    name: newVar.name,
    value: newVar.value,
    appId: newVar.appId,
  }});
};

export const updateVariable = async (req: Request, res: Response) => {
  const app = (req as AuthRequest).authApp;
  if (!app) return res.status(401).json({ message: 'Application not authenticated.' });

  const { id } = req.params;
  const { value } = req.body;
  try {
    const variable = await MongoVariable.findOneAndUpdate({ _id: id, appId: app.ownerId }, { value }, { new: true });
    if (!variable) return res.status(404).json({ message: 'Variable not found.' });
    res.status(200).json({ message: 'Variable updated.', variable: {
      id: (variable._id as any).toString(),
      name: variable.name,
      value: variable.value,
      appId: variable.appId,
    }});
  } catch {
    res.status(404).json({ message: 'Variable not found.' });
  }
};

export const deleteVariable = async (req: Request, res: Response) => {
  const app = (req as AuthRequest).authApp;
  if (!app) return res.status(401).json({ message: 'Application not authenticated.' });

  const { id } = req.params;
  try {
    const deleted = await MongoVariable.findOneAndDelete({ _id: id, appId: app.ownerId });
    if (!deleted) return res.status(404).json({ message: 'Variable not found.' });
    res.status(200).json({ message: 'Variable deleted.' });
  } catch {
    res.status(404).json({ message: 'Variable not found.' });
  }
};

export const getSessionsList = async (req: Request, res: Response) => {
  const app = (req as AuthRequest).authApp;
  if (!app) return res.status(401).json({ message: 'Application not authenticated.' });

  const appSessions = await MongoSession.find({ appId: app.ownerId }).lean();
  res.status(200).json(appSessions.map(s => ({
    sessionId: s.sessionId,
    userName: s.userName,
    ip: s.ip,
    startedAt: s.startedAt,
    status: s.status,
    appId: s.appId,
  })));
};

export const getDashboardStats = async (req: Request, res: Response) => {
  const app = (req as AuthRequest).authApp;
  if (!app) return res.status(401).json({ message: 'Application not authenticated.' });

  const [totalApps, totalLicenses, appUsers, appTokens, appLogs] = await Promise.all([
    App.countDocuments(),
    LicenseModel.countDocuments({ appId: app.ownerId }),
    MongoUser.find({ appId: app.ownerId }).lean(),
    MongoToken.find({ appId: app.ownerId }).lean(),
    MongoLog.find({ appId: app.ownerId }).sort({ timestamp: -1 }).limit(10).lean(),
  ]);

  res.status(200).json({
    totalApps,
    totalLicenses,
    usedLicenses: await LicenseModel.countDocuments({ appId: app.ownerId, status: 'Used' }),
    unusedLicenses: await LicenseModel.countDocuments({ appId: app.ownerId, status: 'Not Used' }),
    totalUsers: appUsers.length,
    activeUsers: appUsers.filter(u => u.status === 'Active').length,
    bannedUsers: appUsers.filter(u => u.status === 'Banned').length,
    expiredUsers: appUsers.filter(u => u.status === 'Expired').length,
    totalTokens: appTokens.length,
    activeTokens: appTokens.filter(t => t.status === 'Active').length,
    totalLogs: await MongoLog.countDocuments({ appId: app.ownerId }),
    recentLogs: appLogs.map(l => ({
      id: (l._id as any).toString(),
      timestamp: l.timestamp,
      pcuser: l.pcuser,
      message: l.message,
    })),
  });
};

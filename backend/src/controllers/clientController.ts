import { Request, Response } from 'express';
import { applications } from '../utils/mockDb';
import { generateUniqueId, hashPassword, comparePassword } from '../utils/utils';
import { LicenseModel } from '../models/MongoLicense';
import { MongoUser } from '../models/MongoUser';
import { MongoToken } from '../models/MongoToken';

export const initClient = (req: Request, res: Response) => {
  res.status(200).json({ message: 'Client initialized successfully.', app: req.authApp });
};

export const registerClient = async (req: Request, res: Response) => {
  const { licenseKey, username, password, hwid, ip } = req.body;
  const app = req.authApp;

  if (!app) return res.status(401).json({ message: 'Application not validated.' });
  if (!licenseKey || !username || !password || !hwid || !ip) {
    return res.status(400).json({ message: 'Missing required fields for registration.' });
  }

  const license = await LicenseModel.findOne({ key: licenseKey, appId: app.ownerId });
  if (!license) return res.status(404).json({ message: 'License not found.' });
  if (license.status === 'Used') return res.status(409).json({ message: 'License already used.' });

  license.status = 'Used';
  license.hwid = hwid;
  await license.save();

  const hashedPassword = await hashPassword(password);
  const newUser = await MongoUser.create({
    username,
    password: hashedPassword,
    hwid,
    ip,
    lastLogin: new Date(),
    status: 'Active',
    appId: app.ownerId,
  });

  res.status(201).json({ message: 'User registered successfully.', user: {
    id: (newUser._id as any).toString(),
    username: newUser.username,
    status: newUser.status,
  }});
};

export const loginClient = async (req: Request, res: Response) => {
  const { username, password, hwid, ip } = req.body;
  const app = req.authApp;

  if (!app) return res.status(401).json({ message: 'Application not validated.' });
  if (!username || !password || !hwid || !ip) {
    return res.status(400).json({ message: 'Missing required fields for login.' });
  }

  const user = await MongoUser.findOne({ username, appId: app.ownerId });
  if (!user) return res.status(404).json({ message: 'User not found.' });

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials.' });

  if (user.hwid !== hwid) {
    return res.status(403).json({ message: 'Hardware Mismatch: This account is locked to a different device.' });
  }

  user.ip = ip;
  user.lastLogin = new Date();
  await user.save();

  const newToken = await MongoToken.create({
    token: generateUniqueId(),
    userId: (user._id as any).toString(),
    appId: app.ownerId,
    status: 'Active',
  });

  res.status(200).json({ message: 'Login successful.', user: {
    id: (user._id as any).toString(),
    username: user.username,
    status: user.status,
  }, token: newToken.token });
};

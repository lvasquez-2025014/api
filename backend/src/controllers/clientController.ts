import { Request, Response } from 'express';
import { applications, licenses, users, tokens } from '../utils/mockDb';
import { generateUniqueId, hashPassword, comparePassword } from '../utils/utils';
import { User, Token } from '../models';

export const initClient = (req: Request, res: Response) => {
  // La validación principal ya se hizo en el middleware clientValidation
  res.status(200).json({ message: 'Client initialized successfully.', app: req.authApp });
};

export const registerClient = async (req: Request, res: Response) => {
  const { licenseKey, username, password, hwid, ip } = req.body;
  const app = req.authApp; // Viene del middleware clientValidation

  if (!app) {
    return res.status(401).json({ message: 'Application not validated.' });
  }

  if (!licenseKey || !username || !password || !hwid || !ip) {
    return res.status(400).json({ message: 'Missing required fields for registration.' });
  }

  const license = licenses.find(l => l.key === licenseKey && l.appId === app.id);

  if (!license) {
    return res.status(404).json({ message: 'License not found.' });
  }

  if (license.status === 'Used') {
    return res.status(409).json({ message: 'License already used.' });
  }

  // Marcar licencia como usada
  license.status = 'Used';
  license.hwid = hwid;

  const hashedPassword = await hashPassword(password);

  const newUser: User = {
    id: generateUniqueId(),
    username,
    password: hashedPassword,
    hwid,
    ip,
    lastLogin: new Date(),
    status: 'Active',
    appId: app.id,
  };
  users.push(newUser);

  res.status(201).json({ message: 'User registered successfully.', user: newUser });
};

export const loginClient = async (req: Request, res: Response) => {
  const { username, password, hwid, ip } = req.body;
  const app = req.authApp; // Viene del middleware clientValidation

  if (!app) {
    return res.status(401).json({ message: 'Application not validated.' });
  }

  if (!username || !password || !hwid || !ip) {
    return res.status(400).json({ message: 'Missing required fields for login.' });
  }

  const user = users.find(u => u.username === username && u.appId === app.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  if (user.hwid !== hwid) {
    return res.status(403).json({ message: 'Hardware Mismatch: This account is locked to a different device.' });
  }

  // Actualizar última IP y fecha de login
  user.ip = ip;
  user.lastLogin = new Date();

  // Generar un token de sesión
  const newToken: Token = {
    id: generateUniqueId(),
    token: generateUniqueId(), // Usar un ID único como token de sesión simple
    userId: user.id,
    appId: app.id,
    status: 'Active',
  };
  tokens.push(newToken);

  res.status(200).json({ message: 'Login successful.', user, token: newToken.token });
};

import { Request, Response } from 'express';
import { applications, licenses, users } from '../utils/mockDb';
import { generateUniqueId, generateLicenseKey } from '../utils/utils';
import { Application, License } from '../models';

interface AuthRequest extends Request {
  authApp?: Application;
}

export const generateLicenses = (req: AuthRequest, res: Response) => {
  const { count, durationDays, subLevel } = req.body;
  const app = req.authApp; // Viene del middleware sellerAuth

  if (!app) {
    return res.status(401).json({ message: 'Application not authenticated.' });
  }

  if (!count || !durationDays || !subLevel) {
    return res.status(400).json({ message: 'Missing required fields: count, durationDays, subLevel.' });
  }

  const generated: License[] = [];
  for (let i = 0; i < count; i++) {
    const newLicense: License = {
      id: generateUniqueId(),
      key: generateLicenseKey(),
      durationDays: durationDays,
      status: 'Not Used',
      subLevel: subLevel,
      hwid: null,
      expiresAt: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000), // Calcular fecha de expiración
      appId: app.id,
    };
    licenses.push(newLicense);
    generated.push(newLicense);
  }

  res.status(201).json({ message: `${count} licenses generated successfully.`, licenses: generated });
};

export const getLicenses = (req: Request, res: Response) => {
  const app = req.authApp; // Viene del middleware sellerAuth

  if (!app) {
    return res.status(401).json({ message: 'Application not authenticated.' });
  }

  const appLicenses = licenses.filter(license => license.appId === app.id);
  res.status(200).json(appLicenses);
};

export const getUsers = (req: Request, res: Response) => {
  const app = req.authApp; // Viene del middleware sellerAuth

  if (!app) {
    return res.status(401).json({ message: 'Application not authenticated.' });
  }

  const appUsers = users.filter(user => user.appId === app.id);
  res.status(200).json(appUsers);
};

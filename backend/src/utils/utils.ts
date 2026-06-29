import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export const generateUniqueId = (): string => {
  return crypto.randomBytes(16).toString('hex');
};

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateLicenseKey = (): string => {
  const prefix = 'KEYAUTH';
  const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}-${randomPart}`;
};

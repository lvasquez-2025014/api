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

export const generateLicenseKey = (prefix: string = 'KEYAUTH'): string => {
  const safePrefix = prefix.replace(/[^A-Za-z0-9]/g, '').toUpperCase() || 'KEYAUTH';
  const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${safePrefix}-${randomPart}`;
};

import { Request, Response, NextFunction } from 'express';
import { BannedIP } from '../models/BannedIP';

export const banCheck = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
      || req.socket.remoteAddress
      || 'unknown';

    const ownerIP = process.env.OWNER_IP || '';
    if (ip === ownerIP) return next();

    const banned = await BannedIP.findOne({ ip });
    if (banned) {
      return res.status(403).json({
        banned: true,
        message: 'Your IP has been banned for security violations',
        reason: banned.reason,
        bannedAt: banned.bannedAt,
      });
    }

    next();
  } catch {
    next();
  }
};

import { Router, Request, Response } from 'express';
import { BannedIP } from '../models/BannedIP';
import { authMiddleware, ownerOnly, AuthRequest } from '../middlewares/auth';

const router = Router();

router.get('/', authMiddleware, ownerOnly, async (req: Request, res: Response) => {
  try {
    const bans = await BannedIP.find({}).sort({ bannedAt: -1 });
    res.json(bans);
  } catch {
    res.status(500).json({ message: 'Error fetching bans' });
  }
});

router.post('/ban', authMiddleware, ownerOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { ip, reason } = req.body;
    if (!ip) return res.status(400).json({ message: 'IP is required' });

    const ownerIP = process.env.OWNER_IP || '';
    if (ip === ownerIP) {
      return res.status(400).json({ message: 'Cannot ban the owner IP' });
    }

    const existing = await BannedIP.findOne({ ip });
    if (existing) return res.status(400).json({ message: 'IP already banned' });

    const ban = await BannedIP.create({
      ip,
      reason: reason || 'DevTools detected',
      bannedBy: req.user?.username || 'owner',
    });

    res.json(ban);
  } catch {
    res.status(500).json({ message: 'Error banning IP' });
  }
});

router.post('/unban', authMiddleware, ownerOnly, async (req: AuthRequest, res: Response) => {
  try {
    const { ip } = req.body;
    if (!ip) return res.status(400).json({ message: 'IP is required' });

    const ban = await BannedIP.findOneAndDelete({ ip });
    if (!ban) return res.status(404).json({ message: 'IP not found in ban list' });

    res.json({ message: 'IP unbanned successfully' });
  } catch {
    res.status(500).json({ message: 'Error unbanning IP' });
  }
});

router.post('/report-devtools', async (req: Request, res: Response) => {
  try {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
      || req.socket.remoteAddress
      || 'unknown';

    const ownerIP = process.env.OWNER_IP || '';
    if (ip === ownerIP) {
      return res.json({ banned: false, exempt: true });
    }

    const existing = await BannedIP.findOne({ ip });
    if (existing) {
      return res.json({ banned: true, message: 'Your IP has been banned for opening DevTools' });
    }

    await BannedIP.create({
      ip,
      reason: 'DevTools detected',
      bannedBy: 'system-antidevtools',
    });

    res.json({ banned: true, message: 'Your IP has been banned for opening DevTools' });
  } catch {
    res.status(500).json({ message: 'Error reporting DevTools' });
  }
});

router.get('/check', async (req: Request, res: Response) => {
  try {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
      || req.socket.remoteAddress
      || 'unknown';

    const ownerIP = process.env.OWNER_IP || '';
    if (ip === ownerIP) {
      return res.json({ banned: false, exempt: true });
    }

    const existing = await BannedIP.findOne({ ip });
    if (existing) {
      return res.json({ banned: true, message: 'Your IP has been banned' });
    }

    res.json({ banned: false });
  } catch {
    res.status(500).json({ message: 'Error checking ban status' });
  }
});

export default router;

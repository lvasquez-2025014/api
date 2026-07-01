import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import { connectDB } from './config/mongo';
import { Account } from './models/Account';
import { App } from './models/App';
import authRoutes from './routes/authRoutes';
import appRoutes from './routes/appRoutes';
import sellerRoutes from './routes/sellerRoutes';
import sellerManagementRoutes from './routes/sellerManagementRoutes';
import clientRoutes from './routes/clientRoutes';
import keyauthRoutes from './routes/keyauthRoutes';
import banRoutes from './routes/banRoutes';
import { banCheck } from './middlewares/banCheck';
import { applications } from './utils/mockDb';
import { generateUniqueId } from './utils/utils';
import { Application } from './models';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://api-frontend-navy.vercel.app';

const isProduction = process.env.NODE_ENV === 'production';

app.use(helmet());

app.use(cors({
  origin: isProduction
    ? [FRONTEND_URL, 'https://api-frontend-navy.vercel.app']
    : ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Owner-Id', 'X-Secret'],
  credentials: true,
}));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts, please try again later.' },
});

app.use(mongoSanitize());

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.text({ type: 'application/x-www-form-urlencoded' }));
app.use(cookieParser());

app.use((req, res, next) => {
  res.removeHeader('X-Powered-By');
  next();
});

const seedData = async () => {
  const ownerExists = await Account.findOne({ role: 'owner' });

  if (ownerExists && !ownerExists.password.startsWith('$2a$') && !ownerExists.password.startsWith('$2b$')) {
    console.log('Owner password is not hashed. Re-hashing...');
    const ownerPass = process.env.OWNER_PASSWORD || 'admin123';
    ownerExists.password = await bcrypt.hash(ownerPass, 10);
    await ownerExists.save();
    console.log('Owner password re-hashed successfully.');
  }

  if (!ownerExists) {
    const ownerUser = process.env.OWNER_USERNAME || 'owner';
    const ownerPass = process.env.OWNER_PASSWORD || 'admin123';
    const hashed = await bcrypt.hash(ownerPass, 10);
    await Account.create({
      username: ownerUser,
      email: `${ownerUser}@oficialauth.local`,
      password: hashed,
      role: 'owner',
    });
  }
};

const loadAppsFromMongo = async () => {
  const mongoApps = await App.find({});
  for (const ma of mongoApps) {
    const exists = applications.find(a => a.ownerId === ma.ownerId);
    if (!exists) {
      applications.push({
        id: generateUniqueId(),
        name: ma.name,
        version: ma.version,
        status: (ma.status as 'Active' | 'Paused') || 'Active',
        ownerId: ma.ownerId,
        secret: ma.secret,
      });
    }
  }
};

const start = async () => {
  await connectDB();
  await seedData();
  await loadAppsFromMongo();

  app.use('/api/auth', authLimiter, authRoutes);
  app.use('/api/apps', appRoutes);
  app.use('/api/1.0', keyauthRoutes);
  app.use('/api/v1/seller', sellerRoutes);
  app.use('/api/v1/seller-management', sellerManagementRoutes);
  app.use('/api/v1/client', authLimiter, clientRoutes);
  app.use('/api/v1/bans', banRoutes);

  app.get('/api/v1/ban-check', banCheck, (req, res) => {
    res.json({ banned: false });
  });

  app.use((req, res) => {
    res.status(404).json({ message: 'Not found' });
  });

  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error');
    res.status(500).json({ message: 'Internal server error' });
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();

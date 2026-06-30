import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
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
import { applications } from './utils/mockDb';
import { generateUniqueId } from './utils/utils';
import { Application } from './models';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text({ type: 'application/x-www-form-urlencoded' }));

const seedData = async () => {
  const ownerExists = await Account.findOne({ role: 'owner' });
  if (!ownerExists) {
    const hashed = await bcrypt.hash('admin123', 10);
    await Account.create({
      username: 'owner',
      email: 'owner@keyauth.local',
      password: hashed,
      role: 'owner',
    });
    console.log('Default owner created: owner / admin123');
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
  console.log(`Loaded ${applications.length} apps into memory from MongoDB`);
};

const start = async () => {
  await connectDB();
  await seedData();
  await loadAppsFromMongo();

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/apps', appRoutes);
  app.use('/api/1.0', keyauthRoutes);
  app.use('/api/v1/seller', sellerRoutes);
  app.use('/api/v1/seller-management', sellerManagementRoutes);
  app.use('/api/v1/client', clientRoutes);

  app.listen(PORT, () => {
    console.log(`\n=== Server running on port ${PORT} ===`);
    console.log(`Auth API:    http://localhost:${PORT}/api/auth`);
    console.log(`Apps API:    http://localhost:${PORT}/api/apps`);
    console.log(`KeyAuth API: http://localhost:${PORT}/api/1.0`);
    console.log(`Seller API:  http://localhost:${PORT}/api/v1/seller`);
    console.log(`Client API:  http://localhost:${PORT}/api/v1/client`);
    if (process.env.NODE_ENV === 'production') {
      console.log(`Frontend:    http://localhost:${PORT}`);
    }
    console.log('');
  });
};

start();

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import sellerRoutes from './routes/sellerRoutes';
import clientRoutes from './routes/clientRoutes';
import keyauthRoutes from './routes/keyauthRoutes';
import { applications, licenses } from './utils/mockDb';
import { generateUniqueId, generateLicenseKey } from './utils/utils';
import { Application, License } from './models';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
// The KeyAuth C++ SDK sends form-encoded POST data
app.use(express.urlencoded({ extended: true }));
// Also handle raw body for form-encoded data
app.use(express.text({ type: 'application/x-www-form-urlencoded' }));

// Register the C++ app credentials in the mock DB
const setupMockApp = () => {
  // C++ app: "Ost_PERSONAL" with ownerid "PFa3QPrl49"
  const cppApp: Application = {
    id: generateUniqueId(),
    name: 'Ost_PERSONAL',
    version: '2.0',
    status: 'Active',
    ownerId: 'PFa3QPrl49',
    secret: 'a82f04c64df053385f3033202d40a76ac8d90840067b658366cd749805c07b29',
  };

  // Check if already exists
  const existing = applications.find(a => a.name === cppApp.name);
  if (!existing) {
    applications.push(cppApp);
    console.log('C++ app registered:', cppApp.name, '(ownerid:', cppApp.ownerId + ')');

    // Pre-generate a license key for testing
    const testLicense: License = {
      id: generateUniqueId(),
      key: generateLicenseKey(),
      durationDays: 30,
      status: 'Not Used',
      subLevel: 1,
      hwid: null,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      appId: cppApp.id,
    };
    licenses.push(testLicense);
    console.log('Test license key:', testLicense.key);
  }

  // Also keep the web app test
  if (applications.length === 0) {
    const webApp: Application = {
      id: generateUniqueId(),
      name: 'MyTestApp',
      version: '1.0.0',
      status: 'Active',
      ownerId: 'testowner',
      secret: 'testsecret',
    };
    applications.push(webApp);
    console.log('Web test app initialized:', webApp.name);
  }
};

setupMockApp();

// KeyAuth protocol endpoint (C++ SDK compatibility)
app.use('/api/1.0', keyauthRoutes);

// Web dashboard routes
app.use('/api/v1/seller', sellerRoutes);
app.use('/api/v1/client', clientRoutes);

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/dist/public')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../frontend/dist/public', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`\n=== Server running on port ${PORT} ===`);
  console.log(`KeyAuth API: http://localhost:${PORT}/api/1.0`);
  console.log(`Seller API:  http://localhost:${PORT}/api/v1/seller`);
  console.log(`Client API:  http://localhost:${PORT}/api/v1/client`);
  if (process.env.NODE_ENV === 'production') {
    console.log(`Frontend:    http://localhost:${PORT}`);
  }
  console.log('');
});

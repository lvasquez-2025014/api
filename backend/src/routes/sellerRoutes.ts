import { Router } from 'express';
import { sellerAuth } from '../middlewares/sellerAuth';
import {
  getApps, createApp, updateApp, deleteApp,
  generateLicenses, getLicenses, deleteLicense,
  getUsers, createUser, banUser, deleteUser,
  getTokens, revokeToken,
  getSubscriptions, createSubscription, deleteSubscription,
  getLogs, deleteLogs,
  getWebhooks, createWebhook, deleteWebhook,
  getVariables, createVariable, updateVariable, deleteVariable,
  getSessionsList, getDashboardStats,
} from '../controllers/sellerController';

const router = Router();

// Dashboard
router.get('/stats', sellerAuth, getDashboardStats);

// Apps
router.get('/apps', sellerAuth, getApps);
router.post('/apps', sellerAuth, createApp);
router.put('/apps', sellerAuth, updateApp);
router.delete('/apps', sellerAuth, deleteApp);

// Licenses
router.post('/licenses/generate', sellerAuth, generateLicenses);
router.get('/licenses', sellerAuth, getLicenses);
router.delete('/licenses/:id', sellerAuth, deleteLicense);

// Users
router.get('/users', sellerAuth, getUsers);
router.post('/users', sellerAuth, createUser);
router.post('/users/:id/ban', sellerAuth, banUser);
router.delete('/users/:id', sellerAuth, deleteUser);

// Tokens
router.get('/tokens', sellerAuth, getTokens);
router.post('/tokens/:id/revoke', sellerAuth, revokeToken);

// Subscriptions
router.get('/subscriptions', sellerAuth, getSubscriptions);
router.post('/subscriptions', sellerAuth, createSubscription);
router.delete('/subscriptions/:id', sellerAuth, deleteSubscription);

// Logs
router.get('/logs', sellerAuth, getLogs);
router.delete('/logs', sellerAuth, deleteLogs);

// Webhooks
router.get('/webhooks', sellerAuth, getWebhooks);
router.post('/webhooks', sellerAuth, createWebhook);
router.delete('/webhooks/:id', sellerAuth, deleteWebhook);

// Variables
router.get('/variables', sellerAuth, getVariables);
router.post('/variables', sellerAuth, createVariable);
router.put('/variables/:id', sellerAuth, updateVariable);
router.delete('/variables/:id', sellerAuth, deleteVariable);

// Sessions
router.get('/sessions', sellerAuth, getSessionsList);

export default router;

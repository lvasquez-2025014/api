const API_BASE = '/api/v1/seller';

const headers = (ownerId: string, secret: string) => ({
  'Content-Type': 'application/json',
  'X-Owner-Id': ownerId,
  'X-Secret': secret,
});

async function request(path: string, ownerId: string, secret: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: headers(ownerId, secret),
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// Dashboard
export const getStats = (o: string, s: string) => request('/stats', o, s);

// Apps
export const getApps = (o: string, s: string) => request('/apps', o, s);
export const createApp = (o: string, s: string, data: any) => request('/apps', o, s, { method: 'POST', body: JSON.stringify(data) });
export const updateApp = (o: string, s: string, data: any) => request('/apps', o, s, { method: 'PUT', body: JSON.stringify(data) });
export const deleteApp = (o: string, s: string) => request('/apps', o, s, { method: 'DELETE' });

// Licenses
export const getLicenses = (o: string, s: string) => request('/licenses', o, s);
export const generateLicenses = (o: string, s: string, data: { count: number; durationDays: number; subLevel: number; prefix?: string }) =>
  request('/licenses/generate', o, s, { method: 'POST', body: JSON.stringify(data) });
export const deleteLicense = (o: string, s: string, id: string) => request(`/licenses/${id}`, o, s, { method: 'DELETE' });

// Users
export const getUsers = (o: string, s: string) => request('/users', o, s);
export const banUser = (o: string, s: string, id: string) => request(`/users/${id}/ban`, o, s, { method: 'POST' });
export const deleteUser = (o: string, s: string, id: string) => request(`/users/${id}`, o, s, { method: 'DELETE' });

// Tokens
export const getTokens = (o: string, s: string) => request('/tokens', o, s);
export const revokeToken = (o: string, s: string, id: string) => request(`/tokens/${id}/revoke`, o, s, { method: 'POST' });

// Subscriptions
export const getSubscriptions = (o: string, s: string) => request('/subscriptions', o, s);
export const createSubscription = (o: string, s: string, data: { name: string; level: number }) =>
  request('/subscriptions', o, s, { method: 'POST', body: JSON.stringify(data) });
export const deleteSubscription = (o: string, s: string, id: string) => request(`/subscriptions/${id}`, o, s, { method: 'DELETE' });

// Logs
export const getLogs = (o: string, s: string) => request('/logs', o, s);
export const deleteLogs = (o: string, s: string) => request('/logs', o, s, { method: 'DELETE' });

// Webhooks
export const getWebhooks = (o: string, s: string) => request('/webhooks', o, s);
export const createWebhook = (o: string, s: string, data: { name: string; url: string; events?: string }) =>
  request('/webhooks', o, s, { method: 'POST', body: JSON.stringify(data) });
export const deleteWebhook = (o: string, s: string, id: string) => request(`/webhooks/${id}`, o, s, { method: 'DELETE' });

// Variables
export const getVariables = (o: string, s: string) => request('/variables', o, s);
export const createVariable = (o: string, s: string, data: { name: string; value: string }) =>
  request('/variables', o, s, { method: 'POST', body: JSON.stringify(data) });
export const updateVariable = (o: string, s: string, id: string, data: { value: string }) =>
  request(`/variables/${id}`, o, s, { method: 'PUT', body: JSON.stringify(data) });
export const deleteVariable = (o: string, s: string, id: string) => request(`/variables/${id}`, o, s, { method: 'DELETE' });

// Sessions
export const getSessions = (o: string, s: string) => request('/sessions', o, s);

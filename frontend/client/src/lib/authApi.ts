const API_URL = (import.meta as any).env?.VITE_API_URL || '';

interface AuthResponse {
  token: string;
  user: { id: string; username: string; email: string; role: 'owner' | 'seller' };
}

interface AppData {
  _id: string;
  name: string;
  ownerId: string;
  secret: string;
  version: string;
  status: string;
  createdBy: string;
  createdAt: string;
}

function getToken(): string | null {
  return localStorage.getItem('token');
}

function headers(json = true): Record<string, string> {
  const h: Record<string, string> = {};
  const token = getToken();
  if (token) h['Authorization'] = `Bearer ${token}`;
  if (json) h['Content-Type'] = 'application/json';
  return h;
}

export async function login(username: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
}

export async function register(username: string, email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Registration failed');
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function getUser(): { id: string; username: string; email: string; role: 'owner' | 'seller' } | null {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

export async function getApps(): Promise<AppData[]> {
  const res = await fetch(`${API_URL}/api/apps`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data.apps;
}

export async function createApp(name: string, version?: string): Promise<AppData> {
  const res = await fetch(`${API_URL}/api/apps`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ name, version }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data.app;
}

export async function deleteApp(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/apps/${id}`, {
    method: 'DELETE',
    headers: headers(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
}

export async function updateApp(id: string, updates: { name?: string; version?: string; status?: string }): Promise<AppData> {
  const res = await fetch(`${API_URL}/api/apps/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data.app;
}

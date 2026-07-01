function getApiUrl(): string {
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl) return envUrl;
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') return '';
  return 'https://oficial-auth-backend.onrender.com';
}
export const API_URL = getApiUrl();

interface AuthResponse {
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

export async function login(username: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
}

export async function register(username: string, email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Registration failed');
  return data;
}

export function logout() {
  localStorage.removeItem('user');
  fetch(`${API_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
}

export function getUser(): { id: string; username: string; email: string; role: 'owner' | 'seller' } | null {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

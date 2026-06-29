export interface User {
  id: string;
  username: string;
  password: string; // Hasheada con bcrypt
  hwid: string | null; // Hardware ID lock
  ip: string;
  lastLogin: Date;
  status: 'Active' | 'Expired' | 'Banned';
  appId: string;
}

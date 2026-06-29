export interface Token {
  id: string;
  token: string; // Hash de sesión
  userId: string;
  appId: string;
  status: 'Active' | 'Banned';
}

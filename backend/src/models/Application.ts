export interface Application {
  id: string;
  name: string;
  version: string;
  status: 'Active' | 'Paused';
  ownerId: string;
  secret: string; // Cifrado o hasheado
}

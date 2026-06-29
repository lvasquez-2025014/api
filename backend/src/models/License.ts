export interface License {
  id: string;
  key: string; // formato ej: KEYAUTH-XXXX
  durationDays: number;
  status: 'Used' | 'Not Used';
  subLevel: number; // Referencia al nivel de suscripción
  hwid: string | null; // Hardware ID
  expiresAt: Date;
  appId: string;
}

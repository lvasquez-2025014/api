import mongoose, { Document, Schema } from 'mongoose';

export interface ILicense extends Document {
  key: string;
  durationDays: number;
  status: 'Used' | 'Not Used';
  subLevel: number;
  hwid: string | null;
  expiresAt: Date;
  appId: string;
}

const LicenseSchema = new Schema<ILicense>({
  key: { type: String, required: true, unique: true },
  durationDays: { type: Number, required: true },
  status: { type: String, enum: ['Used', 'Not Used'], default: 'Not Used' },
  subLevel: { type: Number, default: 1 },
  hwid: { type: String, default: null },
  expiresAt: { type: Date, required: true },
  appId: { type: String, required: true, index: true },
}, { timestamps: false });

export const LicenseModel = mongoose.model<ILicense>('License', LicenseSchema);

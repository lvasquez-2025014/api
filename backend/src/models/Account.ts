import mongoose, { Document, Schema } from 'mongoose';

export interface IAccount extends Document {
  username: string;
  email: string;
  password: string;
  role: 'owner' | 'seller';
  createdAt: Date;
}

const AccountSchema = new Schema<IAccount>({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3 },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['owner', 'seller'], default: 'seller' },
  createdAt: { type: Date, default: Date.now },
});

export const Account = mongoose.model<IAccount>('Account', AccountSchema);

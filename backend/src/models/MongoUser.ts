import mongoose, { Document, Schema } from 'mongoose';

export interface IMongoUser extends Document {
  username: string;
  password: string;
  hwid: string | null;
  ip: string;
  lastLogin: Date;
  status: 'Active' | 'Expired' | 'Banned';
  appId: string;
}

const MongoUserSchema = new Schema<IMongoUser>({
  username: { type: String, required: true },
  password: { type: String, required: true },
  hwid: { type: String, default: null },
  ip: { type: String, default: '' },
  lastLogin: { type: Date, default: Date.now },
  status: { type: String, enum: ['Active', 'Expired', 'Banned'], default: 'Active' },
  appId: { type: String, required: true, index: true },
}, { timestamps: false });

export const MongoUser = mongoose.model<IMongoUser>('MongoUser', MongoUserSchema);

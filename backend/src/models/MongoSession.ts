import mongoose, { Document, Schema } from 'mongoose';

export interface IMongoSession extends Document {
  sessionId: string;
  userName: string;
  ip: string;
  startedAt: Date;
  status: 'Active' | 'Expired';
  appId: string;
}

const MongoSessionSchema = new Schema<IMongoSession>({
  sessionId: { type: String, required: true },
  userName: { type: String, default: '' },
  ip: { type: String, default: '' },
  startedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['Active', 'Expired'], default: 'Active' },
  appId: { type: String, required: true, index: true },
}, { timestamps: false });

export const MongoSession = mongoose.model<IMongoSession>('MongoSession', MongoSessionSchema);

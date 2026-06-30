import mongoose, { Document, Schema } from 'mongoose';

export interface IMongoToken extends Document {
  token: string;
  userId: string;
  appId: string;
  status: 'Active' | 'Banned';
}

const MongoTokenSchema = new Schema<IMongoToken>({
  token: { type: String, required: true },
  userId: { type: String, required: true },
  appId: { type: String, required: true, index: true },
  status: { type: String, enum: ['Active', 'Banned'], default: 'Active' },
}, { timestamps: false });

export const MongoToken = mongoose.model<IMongoToken>('MongoToken', MongoTokenSchema);

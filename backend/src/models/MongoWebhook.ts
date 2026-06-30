import mongoose, { Document, Schema } from 'mongoose';

export interface IMongoWebhook extends Document {
  name: string;
  url: string;
  events: string;
  status: 'Active' | 'Inactive';
  appId: string;
}

const MongoWebhookSchema = new Schema<IMongoWebhook>({
  name: { type: String, required: true },
  url: { type: String, required: true },
  events: { type: String, default: 'all' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  appId: { type: String, required: true, index: true },
}, { timestamps: false });

export const MongoWebhook = mongoose.model<IMongoWebhook>('MongoWebhook', MongoWebhookSchema);

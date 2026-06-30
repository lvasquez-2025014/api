import mongoose, { Document, Schema } from 'mongoose';

export interface IApp extends Document {
  name: string;
  ownerId: string;
  secret: string;
  version: string;
  status: 'Active' | 'Disabled';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const AppSchema = new Schema<IApp>({
  name: { type: String, required: true, trim: true },
  ownerId: { type: String, required: true, unique: true },
  secret: { type: String, required: true },
  version: { type: String, default: '1.0' },
  status: { type: String, enum: ['Active', 'Disabled'], default: 'Active' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'Account' },
  createdAt: { type: Date, default: Date.now },
});

export const App = mongoose.model<IApp>('App', AppSchema);

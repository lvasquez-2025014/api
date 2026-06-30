import mongoose, { Document, Schema } from 'mongoose';

export interface IMongoSubscription extends Document {
  name: string;
  level: number;
  appId: string;
}

const MongoSubscriptionSchema = new Schema<IMongoSubscription>({
  name: { type: String, required: true },
  level: { type: Number, required: true },
  appId: { type: String, required: true, index: true },
}, { timestamps: false });

export const MongoSubscription = mongoose.model<IMongoSubscription>('MongoSubscription', MongoSubscriptionSchema);

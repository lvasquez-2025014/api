import mongoose, { Document, Schema } from 'mongoose';

export interface IMongoVariable extends Document {
  name: string;
  value: string;
  appId: string;
}

const MongoVariableSchema = new Schema<IMongoVariable>({
  name: { type: String, required: true },
  value: { type: String, required: true },
  appId: { type: String, required: true, index: true },
}, { timestamps: false });

export const MongoVariable = mongoose.model<IMongoVariable>('MongoVariable', MongoVariableSchema);

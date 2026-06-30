import mongoose, { Document, Schema } from 'mongoose';

export interface IMongoLog extends Document {
  timestamp: Date;
  pcuser: string;
  message: string;
  appId: string;
}

const MongoLogSchema = new Schema<IMongoLog>({
  timestamp: { type: Date, default: Date.now },
  pcuser: { type: String, required: true },
  message: { type: String, required: true },
  appId: { type: String, required: true, index: true },
}, { timestamps: false });

export const MongoLog = mongoose.model<IMongoLog>('MongoLog', MongoLogSchema);

import mongoose from 'mongoose';

const bannedIPSchema = new mongoose.Schema({
  ip: { type: String, required: true, unique: true },
  reason: { type: String, default: 'DevTools detected' },
  bannedAt: { type: Date, default: Date.now },
  bannedBy: { type: String, default: 'system' },
});

export const BannedIP = mongoose.model('BannedIP', bannedIPSchema);

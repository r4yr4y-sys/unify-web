import mongoose from 'mongoose';
import profileSchema from './profileSchema.js';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  passwordHash: { type: String, required: true, select: false },
  profileCompleted: { type: Boolean, default: false },
  profile: { type: profileSchema, default: () => ({}) },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', userSchema);

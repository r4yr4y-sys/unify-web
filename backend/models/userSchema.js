import mongoose from 'mongoose';
import profileSchema from './profileSchema.js';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  bookmarkedAnnouncements: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Announcement' }],
  passwordHash: { type: String, required: true, select: false },
  profileCompleted: { type: Boolean, default: false },
  weeklyStudyGoalHours: { type: Number, default: 16, min: 1, max: 168 },
  routineClasses: [{
    id: { type: String, required: true },
    day: { type: String, enum: ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs'], required: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    faculty: { type: String, trim: true, maxlength: 150, default: '' },
    start: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    end: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
  }],
  profile: { type: profileSchema, default: () => ({}) },
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', userSchema);

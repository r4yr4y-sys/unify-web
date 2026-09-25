import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 140 },
  category: { type: String, enum: ['Career', 'Workshop', 'Sports', 'Community'], required: true, trim: true },
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  time: { type: String, required: true, trim: true, maxlength: 100 },
  place: { type: String, required: true, trim: true, maxlength: 160 },
  attendees: { type: Number, default: 0, min: 0 },
  goingUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  color: { type: String, enum: ['violet', 'green', 'orange', 'pink'], default: 'violet' },
}, { timestamps: true });

export default mongoose.models.CampusEvent || mongoose.model('CampusEvent', eventSchema);

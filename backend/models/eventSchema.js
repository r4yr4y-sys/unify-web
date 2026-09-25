import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 140 },
  category: { type: String, required: true, trim: true, maxlength: 60 },
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  time: { type: String, required: true, trim: true, maxlength: 100 },
  place: { type: String, required: true, trim: true, maxlength: 160 },
  attendees: { type: Number, default: 0, min: 0 },
  color: { type: String, enum: ['violet', 'blue', 'orange', 'pink'], default: 'blue' },
}, { timestamps: true });

export default mongoose.models.CampusEvent || mongoose.model('CampusEvent', eventSchema);

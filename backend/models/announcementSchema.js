import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  category: { type: String, enum: ['Academic', 'Campus update', 'Opportunity', 'Student life'], required: true },
  tone: { type: String, enum: ['blue', 'violet', 'amber', 'green'], default: 'blue' },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  copy: { type: String, required: true, trim: true, maxlength: 2000 },
  source: { type: String, required: true, trim: true, maxlength: 120 },
  time: { type: String, default: 'Just now', trim: true, maxlength: 80 },
  important: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema);

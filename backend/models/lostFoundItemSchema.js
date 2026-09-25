import mongoose from 'mongoose';

const lostFoundItemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: { type: String, enum: ['Lost', 'Found'], required: true },
  title: { type: String, required: true, trim: true, maxlength: 150 },
  location: { type: String, required: true, trim: true, maxlength: 250 },
  description: { type: String, trim: true, default: '', maxlength: 1000 },
  reporterName: { type: String, trim: true, maxlength: 100 },
  contactEmail: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  contactPhone: { type: String, trim: true, maxlength: 30, default: '' },
}, { timestamps: true });

export default mongoose.models.LostFoundItem || mongoose.model('LostFoundItem', lostFoundItemSchema);

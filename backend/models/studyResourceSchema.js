import mongoose from 'mongoose';

const studyResourceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['PDF', 'DOCX', 'PPT', 'PPTX', 'LINK'], required: true },
  title: { type: String, required: true, trim: true, maxlength: 180 },
  course: { type: String, trim: true, maxlength: 80, default: 'Unsorted' },
  detail: { type: String, trim: true, maxlength: 300, default: '' },
  originalName: { type: String, trim: true, maxlength: 255 },
  publicId: { type: String, trim: true },
  url: { type: String, required: true, trim: true, maxlength: 2048 },
  bytes: { type: Number, min: 0, default: 0 },
}, { timestamps: true });

export default mongoose.models.StudyResource || mongoose.model('StudyResource', studyResourceSchema);

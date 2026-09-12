import mongoose from 'mongoose';

const studySessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  startedAt: { type: Date, required: true }, endedAt: { type: Date, required: true },
  durationMs: { type: Number, required: true, min: 1 },
  mode: { type: String, enum: ['countdown', 'open'], required: true },
  backgroundId: { type: String, trim: true, default: '' },
}, { timestamps: true });

export default mongoose.models.StudySession || mongoose.model('StudySession', studySessionSchema);

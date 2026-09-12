import mongoose from 'mongoose';

const semesterSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  isCurrent: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Semester || mongoose.model('Semester', semesterSchema);

import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  originalName: { type: String, required: true, trim: true, maxlength: 255 },
  publicId: { type: String, required: true, trim: true },
  url: { type: String, required: true, trim: true },
  bytes: { type: Number, required: true, min: 0 },
}, { _id: false });

const assignmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  // Links initial slots to their course configuration without constraining added slots.
  courseAssessmentId: { type: String, trim: true, sparse: true },
  number: { type: Number, required: true, min: 1 },
  topic: { type: String, trim: true, maxlength: 500, default: '' },
  dueDate: { type: String, default: null },
  questionPaper: { type: fileSchema, default: null },
  completedAssignment: { type: fileSchema, default: null },
}, { timestamps: true });

assignmentSchema.index({ user: 1, course: 1, courseAssessmentId: 1 }, { unique: true, sparse: true });

export default mongoose.models.Assignment || mongoose.model('Assignment', assignmentSchema);

import mongoose from 'mongoose';

const studyPlanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  subject: { type: String, required: true, trim: true, maxlength: 150 },
  topic: { type: String, required: true, trim: true, maxlength: 200 },
  deadline: { type: String, default: null },
  checkpoints: [{ _id: false, id: { type: String, required: true }, text: { type: String, required: true, trim: true, maxlength: 500 }, completed: { type: Boolean, default: false } }],
}, { timestamps: true });

export default mongoose.models.StudyPlan || mongoose.model('StudyPlan', studyPlanSchema);

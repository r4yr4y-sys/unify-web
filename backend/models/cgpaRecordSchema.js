import mongoose from 'mongoose';

const cgpaRecordSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  semesters: [{ _id: false, semester: { type: Number, required: true }, courses: [{ _id: false, id: { type: String, required: true }, name: { type: String, required: true, trim: true, maxlength: 150 }, credits: { type: Number, required: true, min: 0 }, grade: { type: String, required: true, trim: true, maxlength: 10 } }] }],
}, { timestamps: true });

export default mongoose.models.CgpaRecord || mongoose.model('CgpaRecord', cgpaRecordSchema);

import mongoose from 'mongoose';

const flashcardPackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  topic: { type: String, required: true, trim: true, maxlength: 150 },
  colorScheme: { primary: { type: String, required: true, trim: true }, secondary: { type: String, required: true, trim: true } },
  cards: [{ _id: false, id: { type: String, required: true }, question: { type: String, required: true, trim: true, maxlength: 2000 }, answer: { type: String, required: true, trim: true, maxlength: 2000 } }],
}, { timestamps: true });

export default mongoose.models.FlashcardPack || mongoose.model('FlashcardPack', flashcardPackSchema);

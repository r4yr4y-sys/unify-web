import mongoose from 'mongoose';

const availabilitySchema = new mongoose.Schema({
  day: { type: String, enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], required: true },
  start: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
  end: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
}, { _id: false });

const emptyRoomSchema = new mongoose.Schema({
  room: { type: String, required: true, trim: true, maxlength: 40, unique: true },
  type: { type: String, enum: ['classroom', 'lab'], required: true },
  availability: { type: [availabilitySchema], validate: (items) => items.length > 0 },
}, { timestamps: true });

export default mongoose.models.EmptyRoom || mongoose.model('EmptyRoom', emptyRoomSchema);

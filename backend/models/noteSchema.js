import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    originalName: { type: String, required: true, trim: true, maxlength: 255 },
    publicId: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    bytes: { type: Number, required: true, min: 0 },
  },
  { timestamps: true },
);

export default mongoose.models.Note || mongoose.model("Note", noteSchema);

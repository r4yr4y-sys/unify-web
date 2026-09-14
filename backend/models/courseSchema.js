import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    semester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Semester",
      required: true,
      index: true,
    },
    code: { type: String, required: true, trim: true, maxlength: 50 },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    credits: { type: Number, required: true, min: 0, max: 30 },
    totalClasses: { type: Number, required: true, min: 0, max: 300 },
    totalQuizzes: { type: Number, required: true, min: 0, max: 100 },
    totalAssignments: { type: Number, required: true, min: 0, max: 100 },
    // Optional so courses created before course types were introduced remain valid.
    courseType: { type: String, enum: ["theory", "lab"] },
    hasMidterm: { type: Boolean, default: false },
    hasFinal: { type: Boolean, default: false },
    attendance: [
      {
        _id: false,
        number: Number,
        status: {
          type: String,
          enum: ["pending", "attended", "missed"],
          default: "pending",
        },
      },
    ],
    assessments: [
      {
        _id: false,
        id: String,
        type: {
          type: String,
          enum: ["quiz", "assignment", "midterm", "final", "labMidterm", "labFinal"],
          required: true,
        },
        number: Number,
        status: {
          type: String,
          enum: ["pending", "completed", "missed"],
          default: "pending",
        },
        marksObtained: { type: Number, default: null },
        maxMarks: { type: Number, default: null },
        date: { type: String, default: null },
        time: { type: String, default: null },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.models.Course || mongoose.model("Course", courseSchema);

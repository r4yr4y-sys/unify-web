import mongoose from "mongoose";
import profileSchema from "./profileSchema.js";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    emailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: {
      type: String,
      select: false,
    },

    emailVerificationExpires: {
      type: Date,
      select: false,
    },

    emailVerificationSentAt: {
      type: Date,
      select: false,
    },

    passwordResetToken: {
      type: String,
      select: false,
    },

    passwordResetExpires: {
      type: Date,
      select: false,
    },

    passwordResetSentAt: {
      type: Date,
      select: false,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    bookmarkedAnnouncements: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Announcement",
      },
    ],

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },

    profileCompleted: {
      type: Boolean,
      default: false,
    },

    weeklyStudyGoalHours: {
      type: Number,
      default: 16,
      min: 1,
      max: 168,
    },

    profile: {
      type: profileSchema,
      default: () => ({}),
    },
  },
  { timestamps: true },
);

export default mongoose.models.User || mongoose.model("User", userSchema);

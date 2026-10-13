import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/userSchema.js";
import { generateToken, hashToken } from "../utils/authTokens.js";
import { sendVerificationEmail } from "../utils/emailService.js";

const router = express.Router();

router.post("/signup", async (request, response, next) => {
  try {
    const email = request.body.email?.trim().toLowerCase();
    const { password } = request.body;
    if (!email || !password)
      return response
        .status(400)
        .json({ message: "Email and password are required." });
    if (password.length < 8)
      return response
        .status(400)
        .json({ message: "Password must be at least 8 characters." });
    if (await User.exists({ email }))
      return response
        .status(409)
        .json({ message: "An account with this email already exists." });

    const verificationToken = generateToken();
    const verificationTokenHash = hashToken(verificationToken);

    const user = await User.create({
      email,
      passwordHash: await bcrypt.hash(password, 12),
      emailVerified: false,
      emailVerificationToken: verificationTokenHash,
      emailVerificationExpires: new Date(Date.now() + 60 * 60 * 1000),
      emailVerificationSentAt: new Date(),
    });

    try {
      await sendVerificationEmail({ email, token: verificationToken });
    } catch (_error) {
      return response.status(503).json({
        message: "Account created, but we could not send the verification email. Please try resending it shortly.",
      });
    }

    return response.status(201).json({
      message:
        "Account created. Please check your email to verify your account before signing in.",
    });
  } catch (error) {
    if (error?.code === 11000)
      return response
        .status(409)
        .json({ message: "An account with this email already exists." });
    next(error);
  }
});

export default router;

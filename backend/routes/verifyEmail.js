import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/userSchema.js";
import { generateToken, hashToken } from "../utils/authTokens.js";
import { sendPasswordResetEmail, sendVerificationEmail } from "../utils/emailService.js";

const router = express.Router();
const TOKEN_LIFETIME_MS = 60 * 60 * 1000;
const RESEND_INTERVAL_MS = 60 * 1000;
const genericResetMessage = "If an account exists for that email, a password-reset link will arrive shortly.";

const normalizedEmail = (email) => (typeof email === "string" ? email.trim().toLowerCase() : "");
const usableToken = (token) => typeof token === "string" && /^[a-f0-9]{64}$/i.test(token);

router.post("/verify-email", async (request, response, next) => {
  try {
    const { token } = request.body;
    if (!usableToken(token)) return response.status(400).json({ message: "This verification link is invalid or has expired." });
    const user = await User.findOne({
      emailVerificationToken: hashToken(token),
      emailVerificationExpires: { $gt: new Date() },
    }).select("+emailVerificationToken +emailVerificationExpires");
    if (!user) return response.status(400).json({ message: "This verification link is invalid or has expired." });

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    user.emailVerificationSentAt = undefined;
    await user.save();
    return response.json({ message: "Your email has been verified. You can now sign in." });
  } catch (error) {
    next(error);
  }
});

router.post("/resend-verification", async (request, response, next) => {
  try {
    const email = normalizedEmail(request.body.email);
    const user = email && await User.findOne({ email }).select("+emailVerificationSentAt");
    if (user && user.emailVerified !== true && (!user.emailVerificationSentAt || Date.now() - user.emailVerificationSentAt.getTime() >= RESEND_INTERVAL_MS)) {
      const token = generateToken();
      user.emailVerificationToken = hashToken(token);
      user.emailVerificationExpires = new Date(Date.now() + TOKEN_LIFETIME_MS);
      user.emailVerificationSentAt = new Date();
      await user.save();
      try {
        await sendVerificationEmail({ email: user.email, token });
      } catch (_error) {
        return response.status(503).json({ message: "We could not send a verification email. Please try again shortly." });
      }
    }
    return response.status(202).json({ message: "If that account needs verification, an email will arrive shortly." });
  } catch (error) {
    next(error);
  }
});

router.post("/forgot-password", async (request, response, next) => {
  try {
    const email = normalizedEmail(request.body.email);
    const user = email && await User.findOne({ email }).select("+passwordResetSentAt");
    if (user && (!user.passwordResetSentAt || Date.now() - user.passwordResetSentAt.getTime() >= RESEND_INTERVAL_MS)) {
      const token = generateToken();
      user.passwordResetToken = hashToken(token);
      user.passwordResetExpires = new Date(Date.now() + TOKEN_LIFETIME_MS);
      user.passwordResetSentAt = new Date();
      await user.save();
      try {
        await sendPasswordResetEmail({ email: user.email, token });
        console.info("Password-reset email accepted by the email provider.");
      } catch (error) {
        // Keep the client response non-enumerating, but do not hide delivery failures from operators.
        console.error("Password-reset email delivery failed.", error instanceof Error ? error.message : "Unknown email-provider error.");
      }
    } else if (!user) {
      console.info("Password-reset request did not match an account.");
    }
    return response.status(202).json({ message: genericResetMessage });
  } catch (error) {
    next(error);
  }
});

router.post("/reset-password", async (request, response, next) => {
  try {
    const { token, password } = request.body;
    if (!usableToken(token) || typeof password !== "string" || password.length < 8)
      return response.status(400).json({ message: "A valid reset link and a password of at least 8 characters are required." });
    const user = await User.findOne({
      passwordResetToken: hashToken(token),
      passwordResetExpires: { $gt: new Date() },
    }).select("+passwordResetToken +passwordResetExpires +passwordHash");
    if (!user) return response.status(400).json({ message: "This password-reset link is invalid or has expired." });

    user.passwordHash = await bcrypt.hash(password, 12);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetSentAt = undefined;
    await user.save();
    return response.json({ message: "Your password has been reset. You can now sign in." });
  } catch (error) {
    next(error);
  }
});

export default router;

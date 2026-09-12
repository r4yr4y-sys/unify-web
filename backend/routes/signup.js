import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/userSchema.js';
import { createToken, serializeUser } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', async (request, response, next) => {
  try {
    const email = request.body.email?.trim().toLowerCase();
    const { password } = request.body;
    if (!email || !password)
      return response
        .status(400)
        .json({ message: 'Email and password are required.' });
    if (password.length < 8)
      return response
        .status(400)
        .json({ message: 'Password must be at least 8 characters.' });
    if (await User.exists({ email }))
      return response
        .status(409)
        .json({ message: 'An account with this email already exists.' });

    const user = await User.create({
      email,
      passwordHash: await bcrypt.hash(password, 12),
    });
    return response.status(201).json({
      token: createToken(user),
      user: serializeUser(user),
    });
  } catch (error) {
    if (error?.code === 11000)
      return response
        .status(409)
        .json({ message: 'An account with this email already exists.' });
    next(error);
  }
});

export default router;


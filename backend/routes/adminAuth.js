import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/userSchema.js';
import { createToken, serializeUser } from '../middleware/auth.js';

const router = express.Router();

router.post('/signup', async (request, response, next) => {
  try {
    const email = request.body.email?.trim().toLowerCase();
    const { password, setupKey } = request.body;
    if (!process.env.ADMIN_SIGNUP_KEY)
      return response.status(503).json({ message: 'Admin sign-up is not configured.' });
    if (!setupKey || setupKey !== process.env.ADMIN_SIGNUP_KEY)
      return response.status(403).json({ message: 'Invalid admin setup key.' });
    if (!email || !password)
      return response.status(400).json({ message: 'Email and password are required.' });
    if (password.length < 8)
      return response.status(400).json({ message: 'Password must be at least 8 characters.' });
    if (await User.exists({ email }))
      return response.status(409).json({ message: 'An account with this email already exists.' });
    const user = await User.create({ email, role: 'admin', passwordHash: await bcrypt.hash(password, 12) });
    return response.status(201).json({ token: createToken(user), user: serializeUser(user) });
  } catch (error) {
    if (error?.code === 11000)
      return response.status(409).json({ message: 'An account with this email already exists.' });
    next(error);
  }
});

router.post('/signin', async (request, response, next) => {
  try {
    const email = request.body.email?.trim().toLowerCase();
    const { password } = request.body;
    const user = email && await User.findOne({ email }).select('+passwordHash');
    if (!user || user.role !== 'admin' || !(await bcrypt.compare(password || '', user.passwordHash)))
      return response.status(401).json({ message: 'Invalid admin email or password.' });
    return response.json({ token: createToken(user), user: serializeUser(user) });
  } catch (error) {
    next(error);
  }
});

export default router;

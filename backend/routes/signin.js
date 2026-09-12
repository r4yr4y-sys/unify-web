import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/userSchema.js';
import { createToken, serializeUser } from '../middleware/auth.js';

const router = express.Router();

router.post('/signin', async (request, response, next) => {
  try {
    const email = request.body.email?.trim().toLowerCase();
    const { password } = request.body;
    if (!email || !password)
      return response
        .status(400)
        .json({ message: 'Email and password are required.' });

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return response
        .status(401)
        .json({ message: 'Invalid email or password.' });
    }
    return response.json({
      token: createToken(user),
      user: serializeUser(user),
    });
  } catch (error) {
    next(error);
  }
});

export default router;


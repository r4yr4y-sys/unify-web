import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 5000;

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
  },
  { timestamps: true },
);
const User = mongoose.models.User || mongoose.model('User', userSchema);

app.use(express.json());
app.use((request, response, next) => {
  response.setHeader(
    'Access-Control-Allow-Origin',
    process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  );
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization',
  );
  if (request.method === 'OPTIONS') return response.sendStatus(204);
  next();
});

const createToken = (user) =>
  jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

app.post('/api/auth/signup', async (request, response, next) => {
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
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    if (error?.code === 11000)
      return response
        .status(409)
        .json({ message: 'An account with this email already exists.' });
    next(error);
  }
});

app.post('/api/auth/signin', async (request, response, next) => {
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
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    next(error);
  }
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response
    .status(500)
    .json({ message: 'Unable to process your request. Please try again.' });
});

if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
  throw new Error('MONGODB_URI and JWT_SECRET must be set in backend/.env.');
}

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() =>
    app.listen(port, () => console.log(`API listening on port ${port}`)),
  )
  .catch((error) => {
    console.error('MongoDB connection failed', error);
    process.exit(1);
  });

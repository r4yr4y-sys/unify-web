import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 5000;

const profileSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: '', maxlength: 100 },
    department: { type: String, trim: true, default: '', maxlength: 150 },
    semester: { type: String, trim: true, default: '', maxlength: 50 },
    status: { type: String, trim: true, default: '', maxlength: 100 },
    bio: { type: String, trim: true, default: '', maxlength: 500 },
    studentId: { type: String, trim: true, default: '', maxlength: 100 },
    program: { type: String, trim: true, default: '', maxlength: 150 },
    batch: { type: String, trim: true, default: '', maxlength: 100 },
    universityEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
      maxlength: 254,
    },
    phone: { type: String, trim: true, default: '', maxlength: 50 },
    dateOfBirth: { type: Date, default: null },
    gender: { type: String, trim: true, default: '', maxlength: 50 },
    bloodGroup: { type: String, trim: true, default: '', maxlength: 10 },
    address: { type: String, trim: true, default: '', maxlength: 300 },
    academicJourney: {
      school: {
        institution: { type: String, trim: true, default: '', maxlength: 150 },
        years: { type: String, trim: true, default: '', maxlength: 100 },
      },
      college: {
        institution: { type: String, trim: true, default: '', maxlength: 150 },
        years: { type: String, trim: true, default: '', maxlength: 100 },
      },
      university: {
        institution: { type: String, trim: true, default: '', maxlength: 150 },
        years: { type: String, trim: true, default: '', maxlength: 100 },
      },
    },
    emergencyContacts: [
      {
        name: { type: String, trim: true, default: '', maxlength: 100 },
        relationship: { type: String, trim: true, default: '', maxlength: 100 },
        phone: { type: String, trim: true, default: '', maxlength: 50 },
      },
    ],
    socialLinks: {
      spotify: { type: String, trim: true, default: '', maxlength: 500 },
      github: { type: String, trim: true, default: '', maxlength: 500 },
      instagram: { type: String, trim: true, default: '', maxlength: 500 },
      linkedin: { type: String, trim: true, default: '', maxlength: 500 },
      facebook: { type: String, trim: true, default: '', maxlength: 500 },
    },
  },
  { _id: false },
);

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
    profileCompleted: { type: Boolean, default: false },
    profile: { type: profileSchema, default: () => ({}) },
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
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
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

const serializeUser = (user) => ({
  id: user.id,
  email: user.email,
  // Older accounts will not have this field until their first profile save.
  profileCompleted: user.profileCompleted === true,
  profile: user.profile || {},
});

const requireAuth = async (request, response, next) => {
  const authorization = request.get('Authorization');
  const token = authorization?.startsWith('Bearer ')
    ? authorization.slice(7)
    : null;

  if (!token)
    return response.status(401).json({ message: 'Authentication is required.' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId);
    if (!user)
      return response.status(404).json({ message: 'User account was not found.' });
    request.user = user;
    next();
  } catch (_error) {
    return response.status(401).json({ message: 'Your session is invalid or has expired.' });
  }
};

const text = (value) => (typeof value === 'string' ? value.trim() : '');
const profileText = (value, maxLength) => text(value).slice(0, maxLength);

const profileFromRequest = (input) => {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new Error('Profile data is required.');

  const profile = {
    name: profileText(input.name, 100),
    department: profileText(input.department, 150),
    semester: profileText(input.semester, 50),
    status: profileText(input.status, 100),
    bio: profileText(input.bio, 500),
    studentId: profileText(input.studentId, 100),
    program: profileText(input.program, 150),
    batch: profileText(input.batch, 100),
    universityEmail: profileText(input.universityEmail, 254).toLowerCase(),
    phone: profileText(input.phone, 50),
    gender: profileText(input.gender, 50),
    bloodGroup: profileText(input.bloodGroup, 10),
    address: profileText(input.address, 300),
    academicJourney: {},
    emergencyContacts: [],
    socialLinks: {},
  };

  if (!profile.name || !profile.department || !profile.semester) {
    const error = new Error('Name, department, and semester are required.');
    error.status = 400;
    throw error;
  }

  if (profile.universityEmail && !/^\S+@\S+\.\S+$/.test(profile.universityEmail)) {
    const error = new Error('University email must be a valid email address.');
    error.status = 400;
    throw error;
  }

  if (input.dateOfBirth) {
    const dateOfBirth = new Date(input.dateOfBirth);
    if (Number.isNaN(dateOfBirth.getTime())) {
      const error = new Error('Date of birth must be a valid date.');
      error.status = 400;
      throw error;
    }
    profile.dateOfBirth = dateOfBirth;
  } else profile.dateOfBirth = null;

  for (const key of ['school', 'college', 'university']) {
    const journey = input.academicJourney?.[key] || {};
    profile.academicJourney[key] = {
      institution: profileText(journey.institution, 150),
      years: profileText(journey.years, 100),
    };
  }

  if (input.emergencyContacts !== undefined && !Array.isArray(input.emergencyContacts)) {
    const error = new Error('Emergency contacts must be a list.');
    error.status = 400;
    throw error;
  }
  profile.emergencyContacts = (input.emergencyContacts || []).slice(0, 5).map((contact) => ({
    name: profileText(contact?.name, 100),
    relationship: profileText(contact?.relationship, 100),
    phone: profileText(contact?.phone, 50),
  }));

  for (const key of ['spotify', 'github', 'instagram', 'linkedin', 'facebook']) {
    const url = profileText(input.socialLinks?.[key], 500);
    if (url && !/^https?:\/\//i.test(url)) {
      const error = new Error(`${key} link must start with http:// or https://.`);
      error.status = 400;
      throw error;
    }
    profile.socialLinks[key] = url;
  }

  return profile;
};

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
      user: serializeUser(user),
    });
  } catch (error) {
    next(error);
  }
});

app.get('/api/profile', requireAuth, (request, response) => {
  response.json({ user: serializeUser(request.user) });
});

app.put('/api/profile', requireAuth, async (request, response, next) => {
  try {
    request.user.profile = profileFromRequest(request.body.profile);
    request.user.profileCompleted = true;
    await request.user.save();
    response.json({ user: serializeUser(request.user) });
  } catch (error) {
    if (error.status) return response.status(error.status).json({ message: error.message });
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

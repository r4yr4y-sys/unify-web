import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import './config/env.js';
import signupRouter from './routes/signup.js';
import signinRouter from './routes/signin.js';
import adminAuthRouter from './routes/adminAuth.js';
import announcementsRouter from './routes/announcements.js';
import eventsRouter from './routes/events.js';
import feedbackRouter from './routes/feedback.js';
import profileRouter from './routes/profile.js';
import apiRouter from './routes/api.js';

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use((request, response, next) => {
  response.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_ORIGIN || 'http://localhost:5173');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (request.method === 'OPTIONS') return response.sendStatus(204);
  next();
});

app.use('/api/auth', signupRouter);
app.use('/api/auth', signinRouter);
app.use('/api/admin/auth', adminAuthRouter);
app.use('/api/announcements', announcementsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api/profile', profileRouter);
app.use('/api', apiRouter);

app.use((error, request, response, _next) => {
  console.error(error);
  if (error instanceof multer.MulterError) {
    return response.status(400).json({
      message: error.code === 'LIMIT_FILE_SIZE'
        ? request.originalUrl.startsWith('/api/profile/avatar')
          ? 'Profile pictures must be 5 MB or smaller.'
          : request.originalUrl.startsWith('/api/resources')
            ? 'Resource files must be 25 MB or smaller.'
            : 'PDF files must be 10 MB or smaller.'
        : 'Unable to process the uploaded file.',
    });
  }
  if (error.status) return response.status(error.status).json({ message: error.message });
  response.status(500).json({ message: 'Unable to process your request. Please try again.' });
});

if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
  throw new Error('MONGODB_URI and JWT_SECRET must be set in backend/.env.');
}

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => app.listen(port, () => console.log('API listening on port ' + port)))
  .catch((error) => {
    console.error('MongoDB connection failed', error);
    process.exit(1);
  });

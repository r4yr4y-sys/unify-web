import express from 'express';
import Feedback from '../models/feedbackSchema.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', requireAuth, async (request, response, next) => {
  try {
    const { type, subject, message } = request.body;
    const allowedTypes = ['Help request', 'Complaint', 'Recommendation'];
    if (!allowedTypes.includes(type) || typeof subject !== 'string' || !subject.trim() || typeof message !== 'string' || !message.trim())
      return response.status(400).json({ message: 'Choose a feedback type and enter a subject and message.' });
    if (subject.trim().length > 140 || message.trim().length > 5000)
      return response.status(400).json({ message: 'Subject or message is too long.' });
    const feedback = await Feedback.create({ user: request.user._id, email: request.user.email, type, subject: subject.trim(), message: message.trim() });
    response.status(201).json({ feedback: { id: feedback.id, type: feedback.type, subject: feedback.subject } });
  } catch (error) { next(error); }
});

router.get('/', requireAdmin, async (_request, response, next) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 }).lean();
    response.json({ feedback });
  } catch (error) { next(error); }
});

export default router;

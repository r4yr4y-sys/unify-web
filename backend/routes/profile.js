import express from 'express';
import { requireAuth, serializeUser } from '../middleware/auth.js';
import { profileFromRequest } from '../utils/profile.js';

const router = express.Router();

router.get('/', requireAuth, (request, response) => {
  response.json({ user: serializeUser(request.user) });
});

router.put('/', requireAuth, async (request, response, next) => {
  try {
    request.user.profile = profileFromRequest(request.body.profile);
    request.user.profileCompleted = true;
    await request.user.save();
    response.json({ user: serializeUser(request.user) });
  } catch (error) {
    if (error.status)
      return response.status(error.status).json({ message: error.message });
    next(error);
  }
});

export default router;

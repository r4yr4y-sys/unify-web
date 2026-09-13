import express from 'express';
import { requireAuth, serializeUser } from '../middleware/auth.js';
import { profileFromRequest } from '../utils/profile.js';
import cloudinary from '../config/cloudinary.js';
import profileImageUpload from '../config/profileImageUpload.js';

const router = express.Router();

router.get('/', requireAuth, (request, response) => {
  response.json({ user: serializeUser(request.user) });
});

router.put('/', requireAuth, async (request, response, next) => {
  try {
    const profile = profileFromRequest(request.body.profile);
    profile.avatarUrl = request.user.profile?.avatarUrl || '';
    profile.avatarPublicId = request.user.profile?.avatarPublicId || '';
    request.user.profile = profile;
    request.user.profileCompleted = true;
    await request.user.save();
    response.json({ user: serializeUser(request.user) });
  } catch (error) {
    if (error.status)
      return response.status(error.status).json({ message: error.message });
    next(error);
  }
});

const uploadProfileImage = (file, userId) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        folder: `unify/profile-pictures/${userId}`,
        public_id: `avatar-${Date.now()}`,
        transformation: [{ width: 400, height: 400, crop: 'limit' }],
      },
      (error, result) => (error ? reject(error) : resolve(result)),
    );
    stream.end(file.buffer);
  });

router.post(
  '/avatar',
  requireAuth,
  profileImageUpload.single('avatar'),
  async (request, response, next) => {
    try {
      if (!request.file) {
        return response.status(400).json({ message: 'A profile picture is required.' });
      }
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        return response.status(503).json({
          message: 'Profile picture uploads are not configured. Add the Cloudinary credentials to backend/.env.',
        });
      }

      const uploaded = await uploadProfileImage(request.file, request.user.id);
      const previousPublicId = request.user.profile?.avatarPublicId;
      request.user.profile.avatarUrl = uploaded.secure_url;
      request.user.profile.avatarPublicId = uploaded.public_id;
      await request.user.save();

      if (previousPublicId) {
        cloudinary.uploader.destroy(previousPublicId, { resource_type: 'image' }).catch(() => {});
      }
      response.json({ user: serializeUser(request.user) });
    } catch (error) {
      next(error);
    }
  },
);

export default router;

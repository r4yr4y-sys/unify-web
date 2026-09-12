import jwt from 'jsonwebtoken';
import User from '../models/userSchema.js';

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
    return response
      .status(401)
      .json({ message: 'Authentication is required.' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId);
    if (!user)
      return response
        .status(404)
        .json({ message: 'User account was not found.' });
    request.user = user;
    next();
  } catch (_error) {
    return response
      .status(401)
      .json({ message: 'Your session is invalid or has expired.' });
  }
};

export { createToken, serializeUser, requireAuth };


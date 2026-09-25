import express from 'express';
import mongoose from 'mongoose';
import Announcement from '../models/announcementSchema.js';
import User from '../models/userSchema.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = express.Router();
const tones = { Academic: 'blue', 'Campus update': 'violet', Opportunity: 'amber', 'Student life': 'green' };
const clean = (body) => ({
  category: body.category,
  tone: tones[body.category],
  title: typeof body.title === 'string' ? body.title.trim() : '',
  copy: typeof body.copy === 'string' ? body.copy.trim() : '',
  source: typeof body.source === 'string' ? body.source.trim() : '',
  time: typeof body.time === 'string' && body.time.trim() ? body.time.trim() : 'Just now',
  publishedOn: typeof body.publishedOn === 'string' && body.publishedOn.trim() ? body.publishedOn.trim() : new Date().toISOString().slice(0, 10),
  important: body.important === true || body.important === 'true',
});
const valid = (item) => item.category && tones[item.category] && item.title && item.copy && item.source && /^\d{4}-\d{2}-\d{2}$/.test(item.publishedOn);

router.get('/', requireAuth, async (_request, response, next) => {
  try {
    const items = await Announcement.find().sort({ publishedOn: -1, createdAt: -1 });
    response.json({ announcements: items.map((item) => ({ ...item.toObject(), publishedOn: item.publishedOn || item.createdAt.toISOString().slice(0, 10) })) });
  } catch (error) { next(error); }
});

router.get('/bookmarks', requireAuth, (request, response) => {
  response.json({ bookmarks: (request.user.bookmarkedAnnouncements || []).map(String) });
});

router.post('/:id/bookmark', requireAuth, async (request, response, next) => {
  try {
    if (!mongoose.isValidObjectId(request.params.id))
      return response.status(404).json({ message: 'Announcement not found.' });
    if (!(await Announcement.exists({ _id: request.params.id })))
      return response.status(404).json({ message: 'Announcement not found.' });
    await request.user.updateOne({ $addToSet: { bookmarkedAnnouncements: request.params.id } });
    const user = await User.findById(request.user._id).select('bookmarkedAnnouncements');
    response.json({ bookmarks: (user?.bookmarkedAnnouncements || []).map(String) });
  } catch (error) { next(error); }
});

router.delete('/:id/bookmark', requireAuth, async (request, response, next) => {
  try {
    if (!mongoose.isValidObjectId(request.params.id))
      return response.status(404).json({ message: 'Announcement not found.' });
    await request.user.updateOne({ $pull: { bookmarkedAnnouncements: request.params.id } });
    const user = await User.findById(request.user._id).select('bookmarkedAnnouncements');
    response.json({ bookmarks: (user?.bookmarkedAnnouncements || []).map(String) });
  } catch (error) { next(error); }
});

router.post('/', requireAdmin, async (request, response, next) => {
  try {
    const item = clean(request.body);
    if (!valid(item)) return response.status(400).json({ message: 'Category, title, description, and source are required.' });
    response.status(201).json({ announcement: await Announcement.create(item) });
  } catch (error) { next(error); }
});

router.put('/:id', requireAdmin, async (request, response, next) => {
  try {
    const item = clean(request.body);
    if (!valid(item)) return response.status(400).json({ message: 'Category, title, description, and source are required.' });
    const updated = await Announcement.findByIdAndUpdate(request.params.id, item, { new: true, runValidators: true });
    if (!updated) return response.status(404).json({ message: 'Announcement not found.' });
    response.json({ announcement: updated });
  } catch (error) { next(error); }
});

router.delete('/:id', requireAdmin, async (request, response, next) => {
  try {
    const deleted = await Announcement.findByIdAndDelete(request.params.id);
    if (!deleted) return response.status(404).json({ message: 'Announcement not found.' });
    await User.updateMany({}, { $pull: { bookmarkedAnnouncements: deleted._id } });
    response.json({ message: 'Announcement deleted.' });
  } catch (error) { next(error); }
});

export default router;

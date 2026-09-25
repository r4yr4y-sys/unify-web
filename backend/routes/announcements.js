import express from 'express';
import mongoose from 'mongoose';
import Announcement from '../models/announcementSchema.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = express.Router();
const seedSchema = new mongoose.Schema({ _id: String }, { versionKey: false });
const AnnouncementSeed = mongoose.models.AnnouncementSeed || mongoose.model('AnnouncementSeed', seedSchema);
const initialAnnouncements = [
  { category: 'Academic', tone: 'blue', title: 'Midterm Examination Schedule', copy: 'Exam dates, times, rooms, and instructions for students.', source: 'Office of the Registrar', time: '2 hours ago', important: true },
  { category: 'Campus update', tone: 'violet', title: 'New Club Formation', copy: 'AUST recently announced the formation of the AUST Model United Nations Cell and AUST Cybersecurity and AI Club.', source: 'University Library', time: 'Yesterday' },
  { category: 'Opportunity', tone: 'amber', title: 'Research Grant Opportunity', copy: 'Call for students to submit research proposals through the AUST Student Research Grant.', source: 'Research & Innovation', time: 'Dec 4' },
  { category: 'Student life', tone: 'green', title: 'Club Recruitment', copy: 'Recruitment for AUST Model United Nations Cell.', source: 'Student Affairs', time: 'Dec 2' },
];
const tones = { Academic: 'blue', 'Campus update': 'violet', Opportunity: 'amber', 'Student life': 'green' };
const clean = (body) => ({
  category: body.category,
  tone: tones[body.category],
  title: typeof body.title === 'string' ? body.title.trim() : '',
  copy: typeof body.copy === 'string' ? body.copy.trim() : '',
  source: typeof body.source === 'string' ? body.source.trim() : '',
  time: typeof body.time === 'string' && body.time.trim() ? body.time.trim() : 'Just now',
  important: body.important === true || body.important === 'true',
});
const valid = (item) => item.category && tones[item.category] && item.title && item.copy && item.source;

router.get('/', requireAuth, async (_request, response, next) => {
  try {
    if (!(await AnnouncementSeed.exists({ _id: 'initial-v1' }))) {
      try {
        if (!(await Announcement.exists())) await Announcement.insertMany(initialAnnouncements);
        await AnnouncementSeed.create({ _id: 'initial-v1' });
      } catch (error) {
        if (error?.code !== 11000) throw error;
      }
    }
    const items = await Announcement.find().sort({ createdAt: -1 });
    response.json({ announcements: items });
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
    response.json({ message: 'Announcement deleted.' });
  } catch (error) { next(error); }
});

export default router;

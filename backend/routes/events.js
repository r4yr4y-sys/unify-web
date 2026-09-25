import express from 'express';
import mongoose from 'mongoose';
import Event from '../models/eventSchema.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = express.Router();
const seedSchema = new mongoose.Schema({ _id: String }, { versionKey: false });
const EventSeed = mongoose.models.EventSeed || mongoose.model('EventSeed', seedSchema);
const initialEvents = [
  { title: 'AUST Career Fair', date: '2026-12-12', time: '10:00 AM – 4:00 PM', place: 'AUST Auditorium', attendees: 84, category: 'Career', color: 'violet' },
  { title: 'CSE Carnival 6.0', date: '2026-12-14', time: '6:30 PM – 8:00 PM', place: 'AUST Multipurpose Hall', attendees: 32, category: 'Workshop', color: 'blue' },
  { title: 'AUST Inter-Department Sports Festival', date: '2026-12-18', time: '3:00 PM – 6:00 PM', place: 'AUST Sports Ground', attendees: 57, category: 'Sports', color: 'orange' },
  { title: 'Blood Donation & Social Welfare Program', date: '2027-01-08', time: '5:30 PM – 7:30 PM', place: 'AUST Campus Courtyard', attendees: 118, category: 'Community', color: 'pink' },
];
const colors = ['violet', 'blue', 'orange', 'pink'];
const clean = (body) => ({
  title: typeof body.title === 'string' ? body.title.trim() : '',
  category: typeof body.category === 'string' ? body.category.trim() : '',
  date: typeof body.date === 'string' ? body.date.trim() : '',
  time: typeof body.time === 'string' ? body.time.trim() : '',
  place: typeof body.place === 'string' ? body.place.trim() : '',
  attendees: Number.isInteger(Number(body.attendees)) && Number(body.attendees) >= 0 ? Number(body.attendees) : 0,
  color: colors.includes(body.color) ? body.color : 'blue',
});
const valid = (event) => event.title && event.category && /^\d{4}-\d{2}-\d{2}$/.test(event.date) && event.time && event.place;
const serialize = (event) => {
  const item = event.toObject ? event.toObject() : event;
  const parsedDate = new Date(`${item.date}T12:00:00`);
  return { ...item, month: parsedDate.toLocaleString('en-US', { month: 'short' }).toUpperCase(), day: parsedDate.getDate().toString().padStart(2, '0') };
};

router.get('/', requireAuth, async (_request, response, next) => {
  try {
    if (!(await EventSeed.exists({ _id: 'initial-v1' }))) {
      try {
        if (!(await Event.exists())) await Event.insertMany(initialEvents);
        await EventSeed.create({ _id: 'initial-v1' });
      } catch (error) { if (error?.code !== 11000) throw error; }
    }
    const events = await Event.find().sort({ date: 1, createdAt: -1 });
    response.json({ events: events.map(serialize) });
  } catch (error) { next(error); }
});

router.post('/', requireAdmin, async (request, response, next) => {
  try {
    const item = clean(request.body);
    if (!valid(item)) return response.status(400).json({ message: 'Title, category, date, time, and location are required.' });
    response.status(201).json({ event: serialize(await Event.create(item)) });
  } catch (error) { next(error); }
});

router.put('/:id', requireAdmin, async (request, response, next) => {
  try {
    const item = clean(request.body);
    if (!valid(item)) return response.status(400).json({ message: 'Title, category, date, time, and location are required.' });
    const updated = await Event.findByIdAndUpdate(request.params.id, item, { new: true, runValidators: true });
    if (!updated) return response.status(404).json({ message: 'Event not found.' });
    response.json({ event: serialize(updated) });
  } catch (error) { next(error); }
});

router.delete('/:id', requireAdmin, async (request, response, next) => {
  try {
    const deleted = await Event.findByIdAndDelete(request.params.id);
    if (!deleted) return response.status(404).json({ message: 'Event not found.' });
    response.json({ message: 'Event deleted.' });
  } catch (error) { next(error); }
});

export default router;

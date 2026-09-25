import express from 'express';
import mongoose from 'mongoose';
import Event from '../models/eventSchema.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = express.Router();
const categories = ['Career', 'Workshop', 'Sports', 'Community'];
const categoryColors = { Career: 'violet', Workshop: 'green', Sports: 'orange', Community: 'pink' };
const clean = (body) => ({
  title: typeof body.title === 'string' ? body.title.trim() : '',
  category: typeof body.category === 'string' ? body.category.trim() : '',
  date: typeof body.date === 'string' ? body.date.trim() : '',
  time: typeof body.time === 'string' ? body.time.trim() : '',
  place: typeof body.place === 'string' ? body.place.trim() : '',
  attendees: Number.isInteger(Number(body.attendees)) && Number(body.attendees) >= 0 ? Number(body.attendees) : 0,
  color: categoryColors[typeof body.category === 'string' ? body.category.trim() : ''] || 'violet',
});
const valid = (event) => event.title && categories.includes(event.category) && /^\d{4}-\d{2}-\d{2}$/.test(event.date) && event.time && event.place;
const serialize = (event) => {
  const item = event.toObject ? event.toObject() : event;
  const parsedDate = new Date(`${item.date}T12:00:00`);
  return { ...item, color: categoryColors[item.category] || 'violet', month: parsedDate.toLocaleString('en-US', { month: 'short' }).toUpperCase(), day: parsedDate.getDate().toString().padStart(2, '0') };
};

router.get('/', requireAuth, async (_request, response, next) => {
  try {
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

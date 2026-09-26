import express from 'express';
import mongoose from 'mongoose';
import EmptyRoom from '../models/emptyRoomSchema.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

const router = express.Router();
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

const clean = (body) => ({
  room: typeof body.room === 'string' ? body.room.trim() : '',
  type: typeof body.type === 'string' ? body.type.trim().toLowerCase() : '',
  availability: Array.isArray(body.availability) ? body.availability.map((slot) => ({
    day: typeof slot?.day === 'string' ? slot.day.trim() : '',
    start: typeof slot?.start === 'string' ? slot.start.trim() : '',
    end: typeof slot?.end === 'string' ? slot.end.trim() : '',
  })) : [],
});

const valid = (room) => room.room && ['classroom', 'lab'].includes(room.type)
  && room.availability.length > 0
  && room.availability.every((slot) => days.includes(slot.day)
    && timePattern.test(slot.start)
    && timePattern.test(slot.end)
    && slot.start < slot.end);

const serialize = (room) => ({
  ...room.toObject(),
  availability: room.availability.map(({ day, start, end }) => ({ day, start, end })),
});

router.get('/', requireAuth, async (_request, response, next) => {
  try {
    const rooms = await EmptyRoom.find().sort({ room: 1 });
    response.json({ rooms: rooms.map(serialize) });
  } catch (error) { next(error); }
});

router.post('/', requireAdmin, async (request, response, next) => {
  try {
    const room = clean(request.body);
    if (!valid(room)) return response.status(400).json({ message: 'Enter a room, room type, day, and valid start and end times.' });
    response.status(201).json({ room: serialize(await EmptyRoom.create(room)) });
  } catch (error) {
    if (error?.code === 11000) return response.status(409).json({ message: 'A room with this name already exists.' });
    next(error);
  }
});

router.delete('/:id', requireAdmin, async (request, response, next) => {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) return response.status(404).json({ message: 'Room not found.' });
    const room = await EmptyRoom.findByIdAndDelete(request.params.id);
    if (!room) return response.status(404).json({ message: 'Room not found.' });
    response.json({ message: 'Room deleted.' });
  } catch (error) { next(error); }
});

export default router;

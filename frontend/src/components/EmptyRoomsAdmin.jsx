import { useEffect, useState } from 'react';
import { DoorOpen, FlaskConical, Trash2 } from 'lucide-react';
import { formatTime } from '../utils/emptyRooms';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];

export default function EmptyRoomsAdmin() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetch(`${apiUrl}/api/empty-rooms`, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Unable to load empty rooms.');
        if (active) setRooms(result.rooms || []);
      })
      .catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const addRoom = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    try {
      const response = await fetch(`${apiUrl}/api/empty-rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
        body: JSON.stringify({ room: fields.room, type: fields.type, availability: [{ day: fields.day, start: fields.start, end: fields.end }] }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Unable to add the room.');
      setRooms((current) => [...current, result.room].sort((a, b) => a.room.localeCompare(b.room)));
      form.reset();
    } catch (requestError) { setError(requestError.message); }
    finally { setSaving(false); }
  };

  const deleteRoom = async (room) => {
    if (!window.confirm(`Delete room ${room.room}?`)) return;
    setError('');
    try {
      const response = await fetch(`${apiUrl}/api/empty-rooms/${room._id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Unable to delete the room.');
      setRooms((current) => current.filter((item) => item._id !== room._id));
    } catch (requestError) { setError(requestError.message); }
  };

  return <>
    <p className="admin-description">Add rooms and the times they are available. Students will see them when they search Empty Rooms.</p>
    <form className="admin-form admin-announcement-form" onSubmit={addRoom}>
      <h2>Add an empty room</h2>
      <label>Room name<input name="room" maxLength="40" placeholder="e.g. 7C08" required /></label>
      <label>Room type<select name="type" defaultValue="classroom"><option value="classroom">Classroom</option><option value="lab">Lab</option></select></label>
      <label>Available day<select name="day" defaultValue="Sunday">{weekdays.map((day) => <option key={day}>{day}</option>)}</select></label>
      <div className="admin-time-range"><label>Available from<input name="start" type="time" min="08:00" max="17:59" defaultValue="08:00" required /></label><span aria-hidden="true">to</span><label>Available until<input name="end" type="time" min="08:01" max="18:00" defaultValue="10:30" required /></label></div>
      <div className="admin-form-actions"><button className="admin-submit" type="submit" disabled={saving}>{saving ? 'Adding room…' : 'Add room'}</button></div>
      {error && <p className="admin-error" role="alert">{error}</p>}
    </form>
    <div className="admin-announcement-list">
      <h2>Managed empty rooms</h2>
      {loading ? <p className="admin-description">Loading rooms…</p> : rooms.length === 0 ? <p className="admin-description">No rooms have been added yet.</p> : rooms.map((room) => <article className="admin-announcement-row" key={room._id}>
        <div><span>{room.type === 'lab' ? <FlaskConical size={14} /> : <DoorOpen size={14} />} {room.type}</span><h3>{room.room}</h3><p>{room.availability.map((slot) => `${slot.day}: ${formatTime(slot.start)}–${formatTime(slot.end)}`).join(' · ')}</p></div>
        <div className="admin-row-actions"><button type="button" onClick={() => deleteRoom(room)} aria-label={`Delete room ${room.room}`}><Trash2 size={15} /> Delete</button></div>
      </article>)}
    </div>
  </>;
}

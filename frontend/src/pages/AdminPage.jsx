import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import unifyLogo from '../assets/unify official logo.png';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const section = location.pathname.replace(/^\/admin\/?/, '').split('/')[0] || 'dashboard';
  const [mode, setMode] = useState('sign-in');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [announcementError, setAnnouncementError] = useState('');
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventError, setEventError] = useState('');
  const [eventsLoading, setEventsLoading] = useState(false);
  const [feedbackItems, setFeedbackItems] = useState([]);
  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    fetch(`${apiUrl}/api/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || result.user?.role !== 'admin') throw new Error('Admin access required.');
        setUser(result.user);
      })
      .catch(() => localStorage.removeItem('adminToken'));
  }, []);

  useEffect(() => {
    if (!user || section !== 'announcements') return;
    let active = true;
    setAnnouncementsLoading(true);
    fetch(`${apiUrl}/api/announcements`, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Unable to load announcements.');
        if (active) setAnnouncements(result.announcements || []);
      })
      .catch((requestError) => { if (active) setAnnouncementError(requestError.message); })
      .finally(() => { if (active) setAnnouncementsLoading(false); });
    return () => { active = false; };
  }, [user, section]);

  useEffect(() => {
    if (!user || section !== 'feedback') return;
    let active = true;
    setFeedbackLoading(true);
    fetch(`${apiUrl}/api/feedback`, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Unable to load feedback.');
        if (active) setFeedbackItems(result.feedback || []);
      })
      .catch((requestError) => { if (active) setFeedbackError(requestError.message); })
      .finally(() => { if (active) setFeedbackLoading(false); });
    return () => { active = false; };
  }, [user, section]);

  useEffect(() => {
    if (!user || section !== 'events') return;
    let active = true;
    setEventsLoading(true);
    fetch(`${apiUrl}/api/events`, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Unable to load events.');
        if (active) setEvents(result.events || []);
      })
      .catch((requestError) => { if (active) setEventError(requestError.message); })
      .finally(() => { if (active) setEventsLoading(false); });
    return () => { active = false; };
  }, [user, section]);

  const submitEvent = async (event) => {
    event.preventDefault();
    setEventError('');
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    const isEditing = Boolean(editingEvent?._id);
    try {
      const response = await fetch(`${apiUrl}/api/events${isEditing ? `/${editingEvent._id}` : ''}`, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
        body: JSON.stringify(fields),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Unable to save event.');
      setEvents((current) => isEditing
        ? current.map((item) => item._id === result.event._id ? result.event : item)
        : [...current, result.event].sort((a, b) => a.date.localeCompare(b.date)));
      setEditingEvent(null);
    } catch (requestError) { setEventError(requestError.message); }
  };

  const deleteEvent = async (item) => {
    if (!window.confirm(`Delete “${item.title}”?`)) return;
    setEventError('');
    try {
      const response = await fetch(`${apiUrl}/api/events/${item._id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Unable to delete event.');
      setEvents((current) => current.filter((entry) => entry._id !== item._id));
      if (editingEvent?._id === item._id) setEditingEvent(null);
    } catch (requestError) { setEventError(requestError.message); }
  };

  const submitAnnouncement = async (event) => {
    event.preventDefault();
    setAnnouncementError('');
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    const isEditing = Boolean(editingAnnouncement?._id);
    try {
      const response = await fetch(`${apiUrl}/api/announcements${isEditing ? `/${editingAnnouncement._id}` : ''}`, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
        body: JSON.stringify(fields),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Unable to save announcement.');
      setAnnouncements((current) => isEditing
        ? current.map((item) => item._id === result.announcement._id ? result.announcement : item)
        : [result.announcement, ...current]);
      setEditingAnnouncement(null);
    } catch (requestError) { setAnnouncementError(requestError.message); }
  };

  const deleteAnnouncement = async (item) => {
    if (!window.confirm(`Delete “${item.title}”?`)) return;
    setAnnouncementError('');
    try {
      const response = await fetch(`${apiUrl}/api/announcements/${item._id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Unable to delete announcement.');
      setAnnouncements((current) => current.filter((entry) => entry._id !== item._id));
      if (editingAnnouncement?._id === item._id) setEditingAnnouncement(null);
    } catch (requestError) { setAnnouncementError(requestError.message); }
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    if (mode === 'sign-up' && fields.password !== fields.confirmPassword) {
      setError('Passwords do not match.');
      setBusy(false);
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/api/admin/auth/${mode === 'sign-up' ? 'signup' : 'signin'}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fields.email, password: fields.password, setupKey: fields.setupKey }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Unable to continue.');
      localStorage.setItem('adminToken', result.token);
      setUser(result.user);
    } catch (requestError) {
      setError(requestError.message || 'Unable to continue.');
    } finally {
      setBusy(false);
    }
  };

  const sections = [
    { id: 'announcements', label: 'Announcements', description: 'Create and manage campus announcements.' },
    { id: 'events', label: 'Events', description: 'Create and manage campus events.' },
    { id: 'empty-rooms', label: 'Empty Rooms', description: 'Review and manage empty room listings.' },
    { id: 'feedback', label: 'Feedback', description: 'Review feedback submitted by students.' },
  ];
  const activeSection = sections.find((item) => item.id === section);

  if (user) return (
    <main className="admin-shell">
      <header className="admin-header"><img src={unifyLogo} alt="Unify" /><span>ADMIN CONSOLE</span></header>
      <div className="admin-layout">
        <nav className="admin-nav" aria-label="Admin pages">
          <button className={`admin-nav__link ${section === 'dashboard' ? 'is-active' : ''}`} onClick={() => navigate('/admin')}>Dashboard</button>
          {sections.map((item) => <button key={item.id} className={`admin-nav__link ${section === item.id ? 'is-active' : ''}`} onClick={() => navigate(`/admin/${item.id}`)}>{item.label}</button>)}
          <button className="admin-signout" type="button" onClick={() => { localStorage.removeItem('adminToken'); setUser(null); navigate('/admin'); }}>Sign out</button>
        </nav>
        <section className="admin-card admin-dashboard">
          <p className="admin-kicker">PRIVATE WORKSPACE</p>
          <h1>{activeSection?.label || 'Admin dashboard'}</h1>
          <p>Signed in as <strong>{user.email}</strong></p>
          {activeSection?.id === 'announcements' ? <>
            <p className="admin-description">{activeSection.description}</p>
            <form key={editingAnnouncement?._id || 'new-announcement'} className="admin-form admin-announcement-form" onSubmit={submitAnnouncement}>
              <h2>{editingAnnouncement?._id ? 'Edit announcement' : 'Create announcement'}</h2>
              <label>Category<select name="category" defaultValue={editingAnnouncement?.category || 'Academic'}><option>Academic</option><option>Campus update</option><option>Opportunity</option><option>Student life</option></select></label>
              <label>Title<input name="title" defaultValue={editingAnnouncement?.title || ''} maxLength="120" required /></label>
              <label>Description<textarea name="copy" defaultValue={editingAnnouncement?.copy || ''} maxLength="2000" rows="4" required /></label>
              <label>Source<input name="source" defaultValue={editingAnnouncement?.source || ''} maxLength="120" placeholder="e.g. Office of the Registrar" required /></label>
              <label>Display time<input name="time" defaultValue={editingAnnouncement?.time || 'Just now'} maxLength="80" /></label>
              <label className="admin-checkbox"><input type="checkbox" name="important" value="true" defaultChecked={editingAnnouncement?.important === true} /> Mark as important</label>
              <div className="admin-form-actions"><button className="admin-submit" type="submit">{editingAnnouncement?._id ? 'Save changes' : 'Publish announcement'}</button>{editingAnnouncement && <button className="admin-cancel" type="button" onClick={() => setEditingAnnouncement(null)}>Cancel</button>}</div>
              {announcementError && <p className="admin-error" role="alert">{announcementError}</p>}
            </form>
            <div className="admin-announcement-list"><h2>Published announcements</h2>
              {announcementsLoading ? <p className="admin-description">Loading announcements…</p> : announcements.length === 0 ? <p className="admin-description">No announcements yet.</p> : announcements.map((item) => <article className="admin-announcement-row" key={item._id}><div><span>{item.category}{item.important ? ' · Important' : ''}</span><h3>{item.title}</h3><p>{item.copy}</p><small>{item.source} · {item.time}</small></div><div className="admin-row-actions"><button type="button" onClick={() => { setEditingAnnouncement(item); setAnnouncementError(''); }}>Edit</button><button type="button" onClick={() => deleteAnnouncement(item)}>Delete</button></div></article>)}
            </div>
          </> : activeSection?.id === 'events' ? <>
            <p className="admin-description">{activeSection.description}</p>
            <form key={editingEvent?._id || 'new-event'} className="admin-form admin-announcement-form" onSubmit={submitEvent}>
              <h2>{editingEvent?._id ? 'Edit event' : 'Create event'}</h2>
              <label>Event title<input name="title" defaultValue={editingEvent?.title || ''} maxLength="140" required /></label>
              <label>Category<input name="category" defaultValue={editingEvent?.category || ''} maxLength="60" placeholder="e.g. Workshop" required /></label>
              <label>Date<input name="date" type="date" defaultValue={editingEvent?.date || ''} required /></label>
              <label>Time<input name="time" defaultValue={editingEvent?.time || ''} maxLength="100" placeholder="e.g. 10:00 AM – 12:00 PM" required /></label>
              <label>Location<input name="place" defaultValue={editingEvent?.place || ''} maxLength="160" placeholder="e.g. AUST Auditorium" required /></label>
              <label>Attendees<input name="attendees" type="number" min="0" step="1" defaultValue={editingEvent?.attendees ?? 0} /></label>
              <label>Card color<select name="color" defaultValue={editingEvent?.color || 'blue'}><option value="violet">Violet</option><option value="blue">Blue</option><option value="orange">Orange</option><option value="pink">Pink</option></select></label>
              <div className="admin-form-actions"><button className="admin-submit" type="submit">{editingEvent?._id ? 'Save changes' : 'Publish event'}</button>{editingEvent && <button className="admin-cancel" type="button" onClick={() => setEditingEvent(null)}>Cancel</button>}</div>
              {eventError && <p className="admin-error" role="alert">{eventError}</p>}
            </form>
            <div className="admin-announcement-list"><h2>Published events</h2>
              {eventsLoading ? <p className="admin-description">Loading events…</p> : events.length === 0 ? <p className="admin-description">No events yet.</p> : events.map((item) => <article className="admin-announcement-row" key={item._id}><div><span>{item.category}</span><h3>{item.title}</h3><p>{item.date} · {item.time} · {item.place}</p><small>{item.attendees} going</small></div><div className="admin-row-actions"><button type="button" onClick={() => { setEditingEvent(item); setEventError(''); }}>Edit</button><button type="button" onClick={() => deleteEvent(item)}>Delete</button></div></article>)}
            </div>
          </> : activeSection?.id === 'feedback' ? <>
            <p className="admin-description">{activeSection.description}</p>
            {feedbackError && <p className="admin-error" role="alert">{feedbackError}</p>}
            <div className="admin-announcement-list"><h2>Messages from students</h2>
              {feedbackLoading ? <p className="admin-description">Loading feedback…</p> : feedbackItems.length === 0 ? <p className="admin-description">No feedback has been submitted yet.</p> : feedbackItems.map((item) => <article className="admin-feedback-row" key={item._id}><div className="admin-feedback-row__top"><span>{item.type}</span><small>{new Date(item.createdAt).toLocaleString()}</small></div><h3>{item.subject}</h3><p>{item.message}</p><small>From {item.email}</small></article>)}
            </div>
          </> : activeSection ? <>
            <p className="admin-description">{activeSection.description}</p>
            <div className="admin-empty"><span aria-hidden="true">✦</span><h2>{activeSection.label}</h2><p>{section === 'feedback' ? 'Student feedback will appear here.' : `No ${activeSection.label.toLowerCase()} have been added yet.`}</p></div>
          </> : <div className="admin-empty"><span aria-hidden="true">✦</span><h2>You’re all set</h2><p>Choose a page to manage campus content.</p></div>}
        </section>
      </div>
    </main>
  );

  return (
    <main className="admin-shell">
      <header className="admin-header"><img src={unifyLogo} alt="Unify" /><span>ADMIN CONSOLE</span></header>
      <section className="admin-card">
        <p className="admin-kicker">PRIVATE WORKSPACE</p>
        <h1>{mode === 'sign-in' ? 'Admin sign in' : 'Create admin account'}</h1>
        <p className="admin-description">{mode === 'sign-in' ? 'Sign in with your administrator account.' : 'Admin accounts require the setup key configured by the site owner.'}</p>
        <div className="admin-tabs" role="tablist" aria-label="Admin account access">
          <button type="button" role="tab" aria-selected={mode === 'sign-in'} className={mode === 'sign-in' ? 'is-active' : ''} onClick={() => { setMode('sign-in'); setError(''); }}>Sign in</button>
          <button type="button" role="tab" aria-selected={mode === 'sign-up'} className={mode === 'sign-up' ? 'is-active' : ''} onClick={() => { setMode('sign-up'); setError(''); }}>Sign up</button>
        </div>
        <form className="admin-form" onSubmit={submit}>
          <label>Email<input name="email" type="email" autoComplete="email" placeholder="admin@example.com" required /></label>
          <label>Password<input name="password" type="password" autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} minLength="8" required /></label>
          {mode === 'sign-up' && <>
            <label>Confirm password<input name="confirmPassword" type="password" autoComplete="new-password" minLength="8" required /></label>
            <label>Admin setup key<input name="setupKey" type="password" autoComplete="off" required /></label>
          </>}
          <button className="admin-submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'sign-in' ? 'Sign in to admin' : 'Create admin account'}</button>
          {error && <p className="admin-error" role="alert">{error}</p>}
        </form>
        <Link className="admin-user-link" to="/login">Return to Unify sign in</Link>
      </section>
    </main>
  );
}

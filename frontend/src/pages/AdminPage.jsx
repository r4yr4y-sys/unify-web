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

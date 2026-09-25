import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import unifyLogo from '../assets/unify official logo.png';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AdminPage() {
  const [mode, setMode] = useState('sign-in');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

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

  if (user) return (
    <main className="admin-shell">
      <header className="admin-header"><img src={unifyLogo} alt="Unify" /><span>ADMIN CONSOLE</span></header>
      <section className="admin-card admin-dashboard">
        <p className="admin-kicker">PRIVATE WORKSPACE</p>
        <h1>Admin dashboard</h1>
        <p>Signed in as <strong>{user.email}</strong></p>
        <div className="admin-empty"><span aria-hidden="true">✦</span><h2>You’re all set</h2><p>Admin tools will appear here as they become available.</p></div>
        <button className="admin-signout" type="button" onClick={() => { localStorage.removeItem('adminToken'); setUser(null); }}>Sign out</button>
      </section>
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

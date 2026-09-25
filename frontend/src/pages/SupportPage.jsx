import { useState } from 'react';
import { LifeBuoy, Send } from 'lucide-react';
import { PageHeader } from '../components/ui';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function SupportPage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setSent(false);
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    try {
      const response = await fetch(`${apiUrl}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        body: JSON.stringify(fields),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Unable to send your feedback.');
      form.reset();
      setSent(true);
    } catch (requestError) {
      setError(requestError.message || 'Unable to send your feedback. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="page support-page">
      <PageHeader eyebrow="We’re here to help" title="Support" description="Ask for help, report a problem, or share an idea to improve Unify." />
      <div className="support-card">
        <div className="support-card__intro"><span><LifeBuoy size={21} /></span><div><h2>Send us a message</h2><p>Your message will be sent to the Unify support team.</p></div></div>
        <form className="support-form" onSubmit={submit}>
          <label>What can we help with?
            <select name="type" defaultValue="Help request" required><option>Help request</option><option>Complaint</option><option>Recommendation</option></select>
          </label>
          <label>Subject<input name="subject" maxLength="140" placeholder="A short summary" required /></label>
          <label>Message<textarea name="message" maxLength="5000" rows="7" placeholder="Tell us a little more…" required /></label>
          {error && <p className="support-error" role="alert">{error}</p>}
          {sent && <p className="support-success" role="status">Thanks for reaching out. Your message was sent to the support team.</p>}
          <button className="support-submit" type="submit" disabled={busy}><Send size={16} />{busy ? 'Sending…' : 'Send message'}</button>
        </form>
      </div>
    </section>
  );
}

import { useContext, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import usePolling from '../hooks/usePolling';
import { api } from '../lib/api';
import { useNotifications } from '../context/NotificationContext';
import { Notice, Field, fieldClass, buttonClass, cardClass } from './PortalUI';
export default function Messages() {
  const { user } = useContext(AuthContext);
  const [params, setParams] = useSearchParams();
  const bookingId = params.get('trip') || '';
  const notifications = useNotifications();
  const [success, setSuccess] = useState('');
  const bookings = usePolling('/bookings', []);
  const messages = usePolling('/messages' + (bookingId ? '?bookingId=' + bookingId : ''), [], 10000);
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const send = async event => {
    event.preventDefault();
    if (sending) return;
    setSending(true); setError(''); setSuccess('');
    try { await api('/messages', { method: 'POST', body: { bookingId, message: body } }); setBody(''); setSuccess('Message sent. The recipient will see an unread-message notification.'); messages.refresh(); notifications.refresh(); }
    catch (err) { setError(err.message); }
    finally { setSending(false); }
  };
  const markRead = async id => {
    try { await notifications.markRead(id); messages.refresh(); }
    catch (err) { setError(err.message); }
  };
  return <main className="p-6 md:p-8">
    <h1 className="text-[34px] font-bold mb-6">Messages</h1>
    {(error || messages.error || bookings.error) && <Notice error>{error || messages.error || bookings.error}</Notice>}
    {success && <Notice>{success}</Notice>}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <form onSubmit={send} className={cardClass}>
        <Field label="Trip / conversation"><select required className={fieldClass} value={bookingId} disabled={sending} onChange={e => { setParams(e.target.value ? { trip: e.target.value } : {}); setSuccess(''); }}><option value="">Choose a trip to compose</option>{bookings.data.map(b => <option key={b._id} value={b._id}>{b.title} — {user.role === 'Travel Agent' ? b.clientName : b.agentId?.fullName}</option>)}</select></Field>
        <Field label="Message"><textarea required disabled={sending} maxLength={4000} rows={6} className={fieldClass} value={body} onChange={e => setBody(e.target.value)} /></Field>
        <button disabled={sending || !bookingId || !body.trim()} className={buttonClass}>{sending ? 'Sending…' : 'Send message'}</button>
      </form>
      <section className={cardClass + ' lg:col-span-2'}>
        <h2 className="text-[22px] font-bold mb-4">Conversation</h2>
        {messages.loading && <Notice>Loading messages…</Notice>}
        {!messages.loading && !messages.data.length && <Notice>No messages yet.</Notice>}
        {[...messages.data].reverse().map(m => <article key={m._id} className="border-b border-[#e2e2e7] py-4">
          <div className="flex justify-between gap-4 text-[13px]"><strong>{m.senderName}{m.senderId === user._id ? ' (You)' : ''}</strong><time>{new Date(m.createdAt).toLocaleString()}</time></div>
          <p className="text-[15px] text-[#414755] whitespace-pre-wrap break-words mt-2">{m.message}</p>
          {m.recipientId === user._id && m.unread && <button onClick={() => markRead(m._id)} className="text-[#0058bc] text-[13px] mt-2">Mark read</button>}
        </article>)}
      </section>
    </div>
  </main>;
}

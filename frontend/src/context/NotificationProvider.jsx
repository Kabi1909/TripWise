import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from './AuthContext';
import { NotificationContext } from './NotificationContext';
import { api } from '../lib/api';
export default function NotificationProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [inbox, setInbox] = useState({ count: 0, messages: [] });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [version, setVersion] = useState(0);
  const seen = useRef(new Set());
  const newestTime = useRef(0);
  const initialized = useRef(false);
  const refresh = useCallback(() => setVersion(v => v + 1), []);
  const dismiss = useCallback(() => setToast(null), []);
  useEffect(() => {
    let active = true;
    let timer;
    const load = async () => {
      try {
        const data = await api('/messages/notifications');
        if (!active) return;
        const latest = data.messages[0];
        const timestamp = latest ? new Date(latest.createdAt).getTime() : 0;
        if (!initialized.current && data.count > 0) {
          setToast({ id: 'unread-summary', title: 'Unread messages', text: 'You have ' + data.count + ' unread message' + (data.count === 1 ? '.' : 's.'), message: latest });
        } else if (initialized.current && latest && !seen.current.has(latest._id) && timestamp >= newestTime.current) {
          setToast({ id: latest._id, title: 'New message from ' + latest.senderName, text: latest.message, message: latest });
        }
        initialized.current = true;
        newestTime.current = Math.max(newestTime.current, timestamp);
        for (const message of data.messages) seen.current.add(message._id);
        setInbox(data);
        setLoading(false);
        setError('');
      } catch (err) {
        if (active) { setError(err.message); setLoading(false); }
      }
      if (active) timer = setTimeout(load, 5000);
    };
    load();
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    return () => { active = false; clearTimeout(timer); window.removeEventListener('focus', onFocus); };
  }, [user._id, version, refresh]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 8000);
    return () => clearTimeout(timer);
  }, [toast]);
  const markRead = useCallback(async id => {
    await api('/messages/' + id + '/read', { method: 'PATCH' });
    setInbox(previous => ({
      count: Math.max(0, previous.count - (previous.messages.some(m => m._id === id) ? 1 : 0)),
      messages: previous.messages.filter(m => m._id !== id),
    }));
    setToast(null);
    refresh();
  }, [refresh]);
  return <NotificationContext.Provider value={{ ...inbox, loading, error, toast, dismiss, refresh, markRead }}>{children}</NotificationContext.Provider>;
}

import { useContext, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
export function AccountAvatar() {
  const { user } = useContext(AuthContext);
  const initial = (user.email?.trim()[0] || user.fullName?.trim()[0] || '?').toUpperCase();
  return <details className="relative" onKeyDown={e => { if (e.key === 'Escape') e.currentTarget.open = false; }} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) e.currentTarget.open = false; }}>
    <summary aria-label={'Account: ' + user.email} title={user.email} className="flex items-center gap-3 list-none cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0058bc] [&::-webkit-details-marker]:hidden">
      <span className="max-w-28 sm:max-w-48 truncate text-[15px] font-semibold text-[#1a1c1f]">{user.fullName}</span>
      <span className="w-8 h-8 shrink-0 rounded-full bg-[#d8e2ff] text-[#0058bc] border border-[#e2e2e7] flex items-center justify-center text-[13px] font-bold">{initial}</span>
    </summary>
    <div className="absolute right-0 top-full mt-3 z-50 w-64 max-w-[calc(100vw-3rem)] bg-white border border-[#e2e2e7] rounded-xl shadow-lg p-4">
      <p className="text-[15px] font-semibold text-[#1a1c1f]">{user.fullName}</p>
      <p className="text-[13px] text-[#414755] break-all">{user.email}</p>
      <p className="text-[11px] text-[#414755] mt-2">{user.role}</p>
    </div>
  </details>;
}
export function NotificationBell() {
  const notifications = useNotifications();
  const navigate = useNavigate();
  const ref = useRef(null);
  const [actionError, setActionError] = useState('');
  const openMessage = async message => {
    try {
      await notifications.markRead(message._id);
      ref.current.open = false;
      setActionError('');
      navigate(message.kind === 'trip-allocation' ? '/trips/' + message.bookingId : '/messages?trip=' + message.bookingId);
    } catch (err) { setActionError(err.message); }
  };
  return <details ref={ref} className="relative" onKeyDown={e => { if (e.key === 'Escape') e.currentTarget.open = false; }} onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget)) e.currentTarget.open = false; }}>
    <summary aria-label={'Notifications, ' + notifications.count + ' unread'} className="list-none cursor-pointer p-2 text-[#414755] hover:bg-[#f3f3f8] rounded-full relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0058bc] [&::-webkit-details-marker]:hidden">
      <Bell size={20} />
      {notifications.count > 0 && <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-[#ba1a1a] text-white rounded-full text-[10px] flex items-center justify-center">{notifications.count > 99 ? '99+' : notifications.count}</span>}
    </summary>
    <div className="absolute right-0 top-full mt-3 z-50 w-72 max-w-[calc(100vw-5rem)] bg-white border border-[#e2e2e7] rounded-xl shadow-lg overflow-hidden">
      <h2 className="p-4 border-b border-[#e2e2e7] text-[17px] font-semibold">Notifications</h2>
      {(notifications.error || actionError) && <p role="alert" className="p-3 text-[13px] text-[#ba1a1a]">{actionError || notifications.error}</p>}
      <div className="max-h-72 overflow-y-auto">
        {notifications.loading && <p className="p-4 text-[13px] text-[#414755]">Loading notifications…</p>}
        {!notifications.loading && !notifications.messages.length && <p className="p-4 text-[13px] text-[#414755]">No unread notifications.</p>}
        {notifications.messages.map(message => <button key={message._id} type="button" onClick={() => openMessage(message)} className="block w-full text-left p-3 border-b border-[#e2e2e7] hover:bg-[#f3f3f8]">
          <span className="block text-[13px] font-semibold">{message.kind === 'trip-allocation' ? 'New trip request · ' + message.senderName : message.senderName}</span>
          <span className="block text-[13px] text-[#414755] truncate">{message.message}</span>
          <time className="text-[11px] text-[#717786]">{new Date(message.createdAt).toLocaleString()}</time>
        </button>)}
      </div>
      <button type="button" onClick={() => { ref.current.open = false; navigate('/messages'); }} className="w-full p-3 text-[13px] font-medium text-[#0058bc] hover:bg-[#f3f3f8]">View all messages</button>
    </div>
  </details>;
}
export function NotificationToast() {
  const { toast, dismiss } = useNotifications();
  const navigate = useNavigate();
  return <div aria-live="polite" aria-atomic="true" className="fixed top-20 right-6 z-[60] max-w-[calc(100vw-3rem)]">
    {toast && <div className="w-80 max-w-full bg-white rounded-xl border border-[#e2e2e7] shadow-lg p-4">
      <div className="flex gap-3 justify-between items-start"><p className="text-[13px] font-semibold text-[#1a1c1f]">{toast.title}</p>
        <button type="button" aria-label="Dismiss notification" onClick={dismiss} className="text-[#414755] rounded-full hover:bg-[#f3f3f8]"><X size={16} /></button></div>
      <p className="text-[13px] text-[#414755] truncate mt-2">{toast.text}</p>
      <button type="button" className="text-[13px] text-[#0058bc] mt-2" onClick={() => { dismiss(); navigate(toast.message?.kind === 'trip-allocation' ? '/trips/' + toast.message.bookingId : '/messages' + (toast.message ? '?trip=' + toast.message.bookingId : '')); }}>{toast.message?.kind === 'trip-allocation' ? 'View trip' : 'View message'}</button>
    </div>}
  </div>;
}
export default function PortalHeader() {
  return <header className="bg-white text-[#1a1c1f] h-16 border-b border-[#e2e2e7] flex items-center justify-between px-6 sticky top-0 z-40">
    <span className="font-bold text-[22px] text-[#0058bc] tracking-tight">WiseTravel</span>
    <div className="flex items-center space-x-3"><NotificationBell /><div className="ml-2 pl-3 border-l border-[#e2e2e7]"><AccountAvatar /></div></div>
  </header>;
}

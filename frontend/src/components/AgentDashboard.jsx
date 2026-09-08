import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import usePolling from '../hooks/usePolling';
import TripEditor from './TripEditor';
import { Modal, Notice } from './PortalUI';
import { Search, Bell, HelpCircle, Settings, Plane, CreditCard, UserPlus, MoreVertical, MessageSquare, Edit3 } from 'lucide-react';

export default function AgentDashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const bookingState = usePolling('/bookings', []);
  const messageState = usePolling('/messages', [], 10000);
  const metrics = usePolling('/bookings/metrics');
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const bookings = bookingState.data.filter(b => (b.clientName + ' ' + b.destination + ' ' + b.status).toLowerCase().includes(query.toLowerCase()));
  const messages = messageState.data.filter(m => m.recipientId === user._id).slice(0, 5);
  const unread = messageState.data.filter(m => m.recipientId === user._id && m.unread).length;

  return (
    <div className="flex-1 min-h-screen flex flex-col bg-[#f9f9fe] font-['Inter']">
      {/* Top Header */}
      <header className="bg-white text-[#1a1c1f] h-16 border-b border-[#e2e2e7] flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center space-x-4">
          <div className="font-bold text-[22px] text-[#0058bc] tracking-tight">WiseTravel</div>
          <div className="relative w-80 hidden md:block ml-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#717786]" size={18} />
            <input 
              type="text" 
              placeholder="Search bookings, clients, or destinations..."
              aria-label="Search bookings"
              value={query} onChange={e => setQuery(e.target.value)}
              className="w-full bg-[#f3f3f8] border-none rounded-full py-1.5 pl-10 pr-4 text-[13px] focus:ring-2 focus:ring-[#0058bc] outline-none"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button onClick={() => navigate('/messages')} aria-label="Messages" className="p-2 text-[#414755] hover:bg-[#f3f3f8] rounded-full relative">
            <Bell size={20} />
            {unread > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ba1a1a] rounded-full"></span>}
          </button>
          <button onClick={() => navigate('/help')} aria-label="Help" className="p-2 text-[#414755] hover:bg-[#f3f3f8] rounded-full hidden sm:block"><HelpCircle size={20} /></button>
          <button onClick={() => navigate('/agent/reports')} aria-label="Reports" className="p-2 text-[#414755] hover:bg-[#f3f3f8] rounded-full hidden sm:block"><Settings size={20} /></button>
          <div className="ml-2 pl-3 border-l border-[#e2e2e7] flex items-center space-x-2">
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" 
              alt={user.fullName}
              className="w-8 h-8 rounded-full object-cover border border-[#e2e2e7]"
            />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-6 md:p-8 flex-1">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h2 className="text-[34px] font-bold text-[#1a1c1f]">Welcome back, {user.fullName}.</h2>
            <p className="text-[17px] text-[#414755]">Here is what's happening with your clients today.</p>
          </div>
          <div className="text-[13px] text-[#414755] bg-[#f3f3f8] px-3 py-1.5 rounded-full font-medium">
            {new Date().toLocaleDateString()}
          </div>
        </div>

        {(bookingState.error || messageState.error || metrics.error) && <Notice error>{bookingState.error || messageState.error || metrics.error}</Notice>}
        {bookingState.loading && <Notice>Loading dashboard…</Notice>}
        {!bookingState.loading && !bookingState.data.length && <Notice>No bookings yet. Use New Trip to create a client itinerary.</Notice>}
        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-5 border border-[#e2e2e7] shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-[#d8e2ff] flex items-center justify-center text-[#0058bc]">
                <Plane size={20} />
              </div>
              <span className="text-[11px] font-semibold text-[#006b27] bg-[#72fe88]/20 px-2 py-1 rounded-full">Current</span>
            </div>
            <div>
              <p className="text-[13px] text-[#414755] font-medium mb-1">Active Bookings</p>
              <h3 className="text-[28px] font-bold text-[#1a1c1f]">{metrics.data?.activeBookings ?? '—'}</h3>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-[#e2e2e7] shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-[#ffdcbf] flex items-center justify-center text-[#8c5000]">
                <CreditCard size={20} />
              </div>
              <span className="text-[11px] font-semibold text-[#006b27] bg-[#72fe88]/20 px-2 py-1 rounded-full">USD · Paid</span>
            </div>
            <div>
              <p className="text-[13px] text-[#414755] font-medium mb-1">Monthly Revenue</p>
              <h3 className="text-[28px] font-bold text-[#1a1c1f]">{metrics.data ? '$' + metrics.data.monthlyRevenue.toLocaleString() : '—'}</h3>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-[#e2e2e7] shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-[#e8e8ed] flex items-center justify-center text-[#414755]">
                <UserPlus size={20} />
              </div>
              <span className="text-[11px] font-semibold text-[#414755] bg-[#e8e8ed] px-2 py-1 rounded-full">30 days</span>
            </div>
            <div>
              <p className="text-[13px] text-[#414755] font-medium mb-1">New Clients (30d)</p>
              <h3 className="text-[28px] font-bold text-[#1a1c1f]">{metrics.data?.newClients ?? '—'}</h3>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Table */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-[#e2e2e7] shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-[#e2e2e7] flex justify-between items-center bg-[#f9f9fe]">
              <h3 className="text-[17px] font-semibold text-[#1a1c1f]">Current Bookings</h3>
              <button onClick={() => navigate('/trips')} className="text-[#0058bc] text-[13px] font-medium hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f3f3f8] text-[#414755] text-[11px] border-b border-[#e2e2e7] uppercase">
                    <th className="p-3 font-semibold">Client</th>
                    <th className="p-3 font-semibold">Destination</th>
                    <th className="p-3 font-semibold">Dates</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e2e7] text-[14px]">
                  {bookings.map((b) => (
                    <tr key={b._id} className="hover:bg-[#f9f9fe] transition-colors">
                      <td className="p-3 flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-[#e8e8ed] flex items-center justify-center font-bold text-[12px] text-[#414755]">
                          {b.clientInitials || 'JD'}
                        </div>
                        <span className="font-medium text-[#1a1c1f]">{b.clientName}</span>
                      </td>
                      <td className="p-3 text-[#414755]">{b.destination}</td>
                      <td className="p-3 text-[#414755] text-[13px]">{b.dates}</td>
                      <td className="p-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                          b.status === 'Confirmed' ? 'bg-[#72fe88]/20 text-[#006b27]' :
                          b.status === 'Pending Payment' ? 'bg-[#ffdcbf]/50 text-[#8c5000]' :
                          'bg-[#ffdad6] text-[#ba1a1a]'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            b.status === 'Confirmed' ? 'bg-[#006b27]' :
                            b.status === 'Pending Payment' ? 'bg-[#8c5000]' : 'bg-[#ba1a1a]'
                          }`}></span>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button onClick={() => setEditing(b)} aria-label={'Edit trip for ' + b.clientName} className="text-[#717786] hover:text-[#0058bc]"><MoreVertical size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Messages Widget */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-[#e2e2e7] shadow-sm flex flex-col justify-between">
            <div className="p-4 border-b border-[#e2e2e7] flex justify-between items-center bg-[#f9f9fe]">
              <h3 className="text-[17px] font-semibold text-[#1a1c1f] flex items-center">
                <MessageSquare size={18} className="mr-2 text-[#0058bc]" /> Messages
              </h3>
              <span className="w-5 h-5 rounded-full bg-[#ba1a1a] text-white text-[10px] font-bold flex items-center justify-center">{unread}</span>
            </div>

            <div className="divide-y divide-[#e2e2e7]/60 flex-1 overflow-y-auto">
              {messages.map((m) => (
                <div key={m._id} role="button" tabIndex={0} onClick={() => navigate('/messages?trip=' + m.bookingId)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate('/messages?trip=' + m.bookingId); } }} className="p-3.5 hover:bg-[#f3f3f8] cursor-pointer flex gap-3 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-[#ffdcbf] text-[#8c5000] font-bold flex items-center justify-center flex-shrink-0 text-sm">
                    {m.senderInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="text-[13px] font-semibold text-[#1a1c1f] truncate">{m.senderName}</h4>
                      <span className="text-[10px] text-[#717786]">{new Date(m.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-[13px] text-[#414755] truncate">{m.message}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-[#e2e2e7] bg-[#f9f9fe]">
              <button onClick={() => navigate('/messages')} className="w-full bg-[#e8e8ed] hover:bg-[#e2e2e7] text-[#414755] text-[13px] font-medium py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors">
                <Edit3 size={16} />
                <span>Compose Message</span>
              </button>
            </div>
          </div>
        </div>
      </main>
      {editing && <Modal title="Edit client trip" onClose={() => setEditing(null)}><TripEditor booking={editing} onSaved={() => { setEditing(null); bookingState.refresh(); metrics.refresh(); }} /></Modal>}
    </div>
  );
} 

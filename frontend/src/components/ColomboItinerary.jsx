import { useContext, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import usePolling from '../hooks/usePolling';
import { destinations } from '../lib/destinations';
import TripEditor from './TripEditor';
import { Modal, Notice } from './PortalUI';
import { SunMedium, ArrowRight, Utensils, Compass } from 'lucide-react';

export default function ColomboItinerary() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const trip = usePolling('/bookings/' + id);
  const history = usePolling('/portal/history', []);
  const intel = usePolling('/intel/' + (trip.data?.destinationId || 'colombo'), null, 600000);
  const [day, setDay] = useState(1);
  const [editing, setEditing] = useState(false);
  const [details, setDetails] = useState(false);
  if (!trip.data) return <main className="p-8"><Notice error={Boolean(trip.error)}>{trip.error || 'Loading itinerary…'}</Notice></main>;
  const booking = trip.data;
  const destination = destinations.find(d => d.id === booking.destinationId);
  const totalDays = Math.round((Date.parse(booking.endDate) - Date.parse(booking.startDate)) / 86400000) + 1;
  const selectedDay = Math.min(day, totalDays);
  const next = booking.status !== 'Cancelled' && booking.schedule.find(item => {
    const date = new Date(Date.parse(booking.startDate) + (item.day - 1) * 86400000).toISOString().slice(0, 10);
    return item.reservation && item.status !== 'past' && new Date(date + 'T' + item.time + ':00+05:30').getTime() >= (trip.updatedAt?.getTime() || 0);
  });
  const local = intel.data?.weather?.city === destination?.title || intel.data?.weather?.city === booking.destination ? intel.data : null;
  const data = {
    ...booking, client: booking.clientName, clientType: booking.status,
    activeDayText: 'Day ' + selectedDay + ' of ' + totalDays,
    highlightTitle: booking.highlightTitle || booking.destination,
    highlightDescription: booking.highlightDescription || 'Your agent will add activities and milestones here.',
    weather: local?.weather || { temp: 'Unavailable', city: booking.destination, tip: 'Loading destination conditions…' },
    exchangeRate: local?.exchangeRate || { base: '1 USD', rate: 'Unavailable' },
    schedule: booking.schedule.filter(item => item.day === selectedDay),
  };
  return (
    <main className="flex-1 p-6 md:p-8 bg-[#f9f9fe] min-h-screen font-['Inter']">
      <header className="flex justify-between items-end mb-8">
        <div>
          <p className="text-[13px] font-semibold text-[#414755] uppercase tracking-wider mb-1">Current Itinerary</p>
          <h2 className="text-[34px] font-bold text-[#1a1c1f]">{data.title}</h2>
        </div>
        <div className="flex items-center gap-3">
          <div>
            {user.role === 'Travel Agent' && <p className="text-[17px] font-semibold text-[#1a1c1f]">{data.client}</p>}
            <p className="text-[11px] text-[#414755]">{data.clientType}</p>
          </div>
        </div>
      </header>

      {trip.error && <Notice error>{trip.error} Showing the last loaded itinerary.</Notice>}
      {intel.error && <Notice error>{intel.error}</Notice>}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Destination Banner */}
        <div className="lg:col-span-8 rounded-xl overflow-hidden relative shadow-md h-[400px]">
          <img 
            src={destination?.img}
            alt={booking.destination}
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#008733] animate-ping"></span>
            <span className="text-[11px] font-bold text-[#1a1c1f] uppercase tracking-wide">{trip.error ? 'Offline' : 'Synced'}</span>
          </div>
          <div className="absolute bottom-0 left-0 p-6 w-full text-white flex justify-between items-end">
            <div>
              <span className="inline-block bg-[#fe9400] text-[#633700] text-[11px] font-bold px-2.5 py-1 rounded-full mb-2">
                {data.activeDayText}
              </span>
              <h3 className="text-[28px] font-bold mb-1">{data.highlightTitle}</h3>
              <p className="text-[15px] text-white/90 max-w-lg">{data.highlightDescription}</p>
            </div>
            <button onClick={() => setDetails(true)} className="bg-[#0058bc] hover:bg-[#004493] text-white px-4 py-2.5 rounded-lg text-[15px] font-semibold flex items-center gap-2 shadow-lg transition-colors">
              View Details <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Local Intel Widgets */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white/80 backdrop-blur-md rounded-xl p-5 shadow-sm border border-[#e2e2e7] flex flex-col justify-between flex-1">
            <div>
              <h4 className="text-[13px] font-semibold text-[#414755] uppercase tracking-wider mb-3">Local Intel</h4>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <SunMedium className="text-[#fe9400]" size={36} />
                  <div>
                    <span className="text-[28px] font-bold text-[#1a1c1f] block leading-none">{data.weather.temp}</span>
                    <span className="text-[11px] text-[#414755]">{data.weather.city}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[22px] font-bold text-[#1a1c1f] block">{data.exchangeRate.base}</span>
                  <span className="text-[11px] text-[#414755] font-medium">= {data.exchangeRate.rate}</span>
                </div>
              </div>
            </div>
            <div className="bg-[#f3f3f8] rounded-lg p-3">
              <p className="text-[11px] text-[#414755]">{data.weather.tip}</p>
              <p className="text-[11px] text-[#414755] mt-2">
                <a href="https://open-meteo.com/" target="_blank" rel="noreferrer" className="underline">Weather forecast</a>{data.weather.observedAt ? ' · ' + data.weather.observedAt : ''}
                {' · '}<a href="https://frankfurter.dev/" target="_blank" rel="noreferrer" className="underline">Daily exchange rate</a>{data.exchangeRate.date ? ' · ' + data.exchangeRate.date : ''}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-[#e2e2e7] flex flex-col justify-center flex-1">
            <h4 className="text-[13px] font-semibold text-[#414755] uppercase tracking-wider mb-3">Up Next</h4>
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-[#0070eb] text-white flex items-center justify-center shrink-0">
                <Utensils size={20} />
              </div>
              <div>
                <p className="text-[17px] font-semibold text-[#1a1c1f]">{next?.title || 'No upcoming reservations'}</p>
                <p className="text-[15px] text-[#414755]">{next ? 'Day ' + next.day + ' · ' + next.time + ' · ' + next.description : 'Your agent can add reservations to your itinerary.'}</p>
                <div className="mt-2 flex gap-3">
                  <button onClick={() => navigate('/messages?trip=' + id)} className="text-[#0058bc] text-[11px] font-semibold hover:underline">{user.role === 'Travel Agent' ? 'Message Client' : 'Message Agent'}</button>
                  {next?.menuUrl && <a href={next.menuUrl} target="_blank" rel="noreferrer" className="text-[#0058bc] text-[11px] font-semibold hover:underline">View Menu</a>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Timeline */}
        <div className="lg:col-span-8 bg-white rounded-xl p-6 shadow-sm border border-[#e2e2e7]">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-[22px] font-bold text-[#1a1c1f]">Day {selectedDay} Schedule</h4>
            <div className="flex items-center gap-3"><select aria-label="Select itinerary day" value={selectedDay} onChange={e => setDay(Number(e.target.value))} className="bg-[#f3f3f8] rounded-lg p-2 text-[13px]">{Array.from({ length: totalDays }, (_, i) => <option key={i} value={i + 1}>Day {i + 1}</option>)}</select>
            {user.role === 'Travel Agent' && <button onClick={() => setEditing(true)} className="text-[#0058bc] text-[13px] font-semibold">Edit</button>}</div>
          </div>
          {!data.schedule.length && <Notice>No activities scheduled for this day yet.</Notice>}
          <div className="relative pl-6 border-l-2 border-[#e8e8ed] space-y-6">
            {data.schedule.map((item, idx) => (
              <div key={idx} className="relative">
                <div className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white ${
                  item.status === 'past' ? 'bg-[#e8e8ed]' :
                  item.status === 'active' ? 'bg-[#0070eb] ring-4 ring-[#0070eb]/20' : 'bg-[#e2e2e7]'
                }`}></div>
                <p className={`text-[11px] font-semibold mb-1 ${item.status === 'active' ? 'text-[#0070eb]' : 'text-[#414755]'}`}>
                  {item.time}
                </p>
                <div className={item.status === 'active' ? 'bg-[#f3f3f8] p-3 rounded-lg border border-[#e2e2e7]' : ''}>
                  <p className={`text-[15px] font-semibold text-[#1a1c1f] ${item.status === 'past' ? 'line-through opacity-60' : ''}`}>
                    {item.title}
                  </p>
                  <p className="text-[13px] text-[#414755]">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recently Viewed */}
        <div className="lg:col-span-4 bg-white rounded-xl p-6 shadow-sm border border-[#e2e2e7]">
          <h4 className="text-[22px] font-bold text-[#1a1c1f] mb-4">Recently Viewed</h4>
          <div className="space-y-3">
            {history.error && <Notice error>{history.error}</Notice>}
            {history.data.filter(h => h.kind === 'destination' || h.kind === 'package').slice(0, 3).map(h => <button key={h._id} onClick={() => navigate('/history')} className="w-full text-left flex items-center gap-3 p-2 hover:bg-[#f3f3f8] rounded-lg transition-colors">
              <div className="w-12 h-12 rounded bg-[#f3f3f8] flex items-center justify-center text-[#414755]"><Compass size={22} /></div>
              <div><p className="text-[15px] font-semibold text-[#1a1c1f]">{h.title}</p><p className="text-[11px] text-[#414755]">{new Date(h.createdAt).toLocaleDateString()}</p></div>
            </button>)}
            {!history.data.length && <p className="text-[13px] text-[#414755]">No recently viewed destinations yet.</p>}
          </div>
          <button onClick={() => navigate('/history')} className="mt-4 w-full py-2 text-center text-[#0058bc] text-[13px] font-medium hover:bg-[#0058bc]/5 rounded-lg transition-colors">
            View All History
          </button>
        </div>
      </div>
      {editing && <Modal title="Edit itinerary" onClose={() => setEditing(false)}><TripEditor booking={booking} onSaved={() => { setEditing(false); trip.refresh(); }} /></Modal>}
      {details && <Modal title={booking.title} onClose={() => setDetails(false)}>
        <p className="text-[15px] text-[#414755] mb-4">{destination?.about}</p>
        <p>{booking.packageName || 'Custom trip'} · {booking.dates} · {booking.groupSize} travelers</p>
        <p className="mt-3">Agent: {booking.agentId?.fullName} · Status: {booking.status}</p>
        <p className="mt-3">{booking.amount ? 'Total: USD ' + booking.amount.toLocaleString() : 'Price awaiting agent confirmation'}</p>
        <p className="mt-3 text-[13px] text-[#414755]">Itinerary last updated: {new Date(booking.updatedAt).toLocaleString()}. Activity statuses are updated by your agent; this page refreshes every 30 seconds.</p>
      </Modal>}
    </main>
  );
} 

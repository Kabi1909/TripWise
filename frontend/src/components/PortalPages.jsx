import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import usePolling from '../hooks/usePolling';
import { recordHistory } from '../lib/api';
import { Notice, Field, fieldClass, buttonClass, cardClass } from './PortalUI';
export function Trips() {
  const trips = usePolling('/bookings', []);
  const { user } = useContext(AuthContext);
  return <main className="p-6 md:p-8">
    <div className="flex justify-between gap-4 items-center mb-6"><h1 className="text-[34px] font-bold">{user.role === 'Travel Agent' ? 'Client itineraries' : 'My trips'}</h1><Link className={buttonClass} to={user.role === 'Travel Agent' ? '/agent/new' : '/'}>New trip</Link></div>
    {trips.error && <Notice error>{trips.error}</Notice>}{trips.loading && <Notice>Loading trips…</Notice>}
    {!trips.loading && !trips.data.length && <Notice>No trips yet. Explore destinations to request your first trip.</Notice>}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{trips.data.map(trip => <Link to={'/trips/' + trip._id} key={trip._id} className={cardClass + ' hover:-translate-y-1 transition-all'}>
      <h2 className="text-[22px] font-bold">{trip.title}</h2><p className="text-[15px] text-[#414755]">{trip.destination}</p>
      <p className="text-[13px] mt-3">{trip.dates} · {trip.groupSize} travelers</p><p className="text-[13px] text-[#0058bc] mt-2">{trip.status}</p>
    </Link>)}</div>
  </main>;
}
export function Clients() {
  const clients = usePolling('/portal/clients', []);
  const [query, setQuery] = useState('');
  return <main className="p-6 md:p-8"><h1 className="text-[34px] font-bold mb-6">Clients</h1>
    <Field label="Search clients"><input className={fieldClass} value={query} onChange={e => setQuery(e.target.value)} /></Field>
    {clients.error && <Notice error>{clients.error}</Notice>}
    {clients.loading && <Notice>Loading clients…</Notice>}
    {!clients.loading && !clients.data.length && <Notice>Create a trip for a registered traveler to add them to your client directory.</Notice>}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{clients.data.filter(c => (c.fullName + ' ' + c.email).toLowerCase().includes(query.toLowerCase())).map(c => <article className={cardClass} key={c._id}>
      <h2 className="text-[22px] font-bold">{c.fullName}</h2><p className="text-[13px] text-[#414755]">{c.email}</p>
      {c.bookings.map(b => <Link key={b._id} to={'/trips/' + b._id} className="block border-t border-[#e2e2e7] mt-3 pt-3 text-[13px] text-[#0058bc]">{b.destination} · {b.dates} · {b.status}</Link>)}
    </article>)}</div></main>;
}
export function Reports() {
  const metrics = usePolling('/bookings/metrics');
  return <main className="p-6 md:p-8"><h1 className="text-[34px] font-bold mb-6">Performance reports</h1>
    {metrics.error && <Notice error>{metrics.error}</Notice>}
    {metrics.loading && <Notice>Loading reports…</Notice>}
    {metrics.data && <><div className="grid grid-cols-1 md:grid-cols-3 gap-6">{[
      ['Active bookings', metrics.data.activeBookings], ['Monthly revenue (USD)', '$' + metrics.data.monthlyRevenue.toLocaleString()], ['New clients (30 days)', metrics.data.newClients],
    ].map(([label, value]) => <div className={cardClass} key={label}><p className="text-[13px] text-[#414755]">{label}</p><h2 className="text-[28px] font-bold">{value}</h2></div>)}</div>
    <p className="text-[13px] text-[#414755] mt-6">Revenue includes fully paid, non-cancelled bookings recorded this calendar month (UTC). New clients are counted from their first booking with you. Updated {new Date(metrics.data.updatedAt).toLocaleString()}.</p></>}
  </main>;
}
export function History() {
  const history = usePolling('/portal/history', []);
  const trips = usePolling('/bookings', []);
  const navigate = useNavigate();
  const [kind, setKind] = useState('all');
  const [flight, setFlight] = useState({ from: '', to: '', date: '', travelers: 1 });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const saveFlight = async event => {
    event.preventDefault();
    setSaving(true); setError('');
    try { await recordHistory('flight', flight.from + ' → ' + flight.to, flight.date + ' · ' + flight.travelers + ' travelers'); history.refresh(); }
    catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };
  return <main className="p-6 md:p-8"><h1 className="text-[34px] font-bold mb-6">Trip history</h1>
    {(history.error || trips.error || error) && <Notice error>{history.error || trips.error || error}</Notice>}
    <Field label="History type"><select className={fieldClass} value={kind} onChange={e => setKind(e.target.value)}>{['all', 'destination', 'package', 'search', 'flight'].map(k => <option key={k}>{k}</option>)}</select></Field>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><section className={cardClass}><h2 className="text-[22px] font-bold mb-4">Recently viewed & searches</h2>
      {history.loading && <Notice>Loading history…</Notice>}
      {!history.loading && !history.data.filter(h => kind === 'all' || h.kind === kind).length && <Notice>No history for this category yet.</Notice>}
      {history.data.filter(h => kind === 'all' || h.kind === kind).map(h => <article key={h._id} className="py-3 border-b border-[#e2e2e7]">
        <h3 className="font-semibold">{h.title}</h3><p className="text-[13px] text-[#414755]">{h.details}</p><p className="text-[11px] text-[#414755]">{h.kind} · {new Date(h.createdAt).toLocaleString()}</p>
        {h.destinationId && <button className="text-[13px] text-[#0058bc] mt-2" onClick={() => navigate('/trips/new?destination=' + h.destinationId)}>Plan this destination</button>}
      </article>)}
    </section><section className={cardClass}><h2 className="text-[22px] font-bold mb-4">Past travel packages</h2>
      {trips.data.filter(t => t.endDate < new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Colombo' })).map(t => <Link className="block py-3 text-[#0058bc]" key={t._id} to={'/trips/' + t._id}>{t.packageName || t.title} · {t.dates}</Link>)}
      {!trips.data.some(t => t.endDate < new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Colombo' })) && <Notice>No past trips yet.</Notice>}
      <form onSubmit={saveFlight} className="mt-6"><h2 className="text-[22px] font-bold mb-3">Flight search notes</h2><p className="text-[13px] text-[#414755] mb-4">Save flight search details for your planning history. This does not check airline availability or book flights.</p>
        <Field label="From"><input required maxLength={80} className={fieldClass} value={flight.from} onChange={e => setFlight({ ...flight, from: e.target.value })} /></Field>
        <Field label="To"><input required maxLength={80} className={fieldClass} value={flight.to} onChange={e => setFlight({ ...flight, to: e.target.value })} /></Field>
        <Field label="Departure"><input type="date" required className={fieldClass} value={flight.date} onChange={e => setFlight({ ...flight, date: e.target.value })} /></Field>
        <Field label="Travelers"><input type="number" required min="1" max="100" className={fieldClass} value={flight.travelers} onChange={e => setFlight({ ...flight, travelers: e.target.value })} /></Field>
        <button disabled={saving} className={buttonClass}>{saving ? 'Saving…' : 'Save search details'}</button>
      </form>
    </section></div>
  </main>;
}
export function Help() {
  return <main className="p-6 md:p-8"><section className={cardClass}><h1 className="text-[28px] font-bold mb-4">Help Center</h1><p className="text-[15px] text-[#414755]">Search destinations from Explore Portal. Choose Customize trip to send dates and group size to an agent. Agents create and update trips from New Trip and Current Bookings. Use Messages for conversations with the agent or traveler assigned to a trip.</p></section></main>;
}

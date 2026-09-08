import { useContext, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { api } from '../lib/api';
import { destinations } from '../lib/destinations';
import usePolling from '../hooks/usePolling';
import { Field, Notice, fieldClass, buttonClass, cardClass } from './PortalUI';
export default function TripEditor({ booking, onSaved }) {
  const { user } = useContext(AuthContext);
  const agent = user.role === 'Travel Agent';
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const agents = usePolling('/portal/agents', []);
  const [form, setForm] = useState(() => ({
    title: booking?.title || '', destinationId: booking?.destinationId || params.get('destination') || 'colombo',
    packageName: booking?.packageName || params.get('package') || '', travelerEmail: booking?.travelerId?.email || '',
    agentId: booking?.agentId?._id || '', startDate: booking?.startDate || '', endDate: booking?.endDate || '',
    groupSize: booking?.groupSize || 1, status: booking?.status || 'Action Required', amount: booking?.amount || 0,
    paidAt: booking?.paidAt?.slice(0, 10) || '', highlightTitle: booking?.highlightTitle || '',
    highlightDescription: booking?.highlightDescription || '', schedule: booking?.schedule || [],
  }));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const change = (name, value) => setForm(previous => ({ ...previous, [name]: value }));
  const activityChange = (index, name, value) => change('schedule', form.schedule.map((item, i) => i === index ? { ...item, [name]: value } : item));
  const save = async event => {
    event.preventDefault();
    if (saving) return;
    setError('');
    if (form.endDate < form.startDate) return setError('End date must be on or after the start date.');
    setSaving(true);
    try {
      const result = await api('/bookings' + (booking ? '/' + booking._id : ''), { method: booking ? 'PATCH' : 'POST', body: form });
      if (onSaved) onSaved(result);
      else navigate('/trips/' + result._id);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };
  return <form onSubmit={save} className={cardClass}>
    <h2 className="text-[28px] font-bold mb-4">{booking ? 'Edit trip' : agent ? 'Create a new trip' : 'Customize your trip'}</h2>
    {error && <Notice error>{error}</Notice>}
    {!agent && <Notice>Send your preferred dates and group size to an agent. Your request is not a confirmed booking; the agent will confirm availability and pricing.</Notice>}
    <Field label="Trip title"><input className={fieldClass} value={form.title} onChange={e => change('title', e.target.value)} placeholder="Your adventure" maxLength={200} /></Field>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Field label="Destination"><select className={fieldClass} value={form.destinationId} onChange={e => change('destinationId', e.target.value)}>{destinations.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}</select></Field>
      <Field label="Package / interests"><input className={fieldClass} value={form.packageName} onChange={e => change('packageName', e.target.value)} maxLength={200} /></Field>
      <Field label="Start date"><input required type="date" className={fieldClass} value={form.startDate} onChange={e => change('startDate', e.target.value)} /></Field>
      <Field label="End date"><input required type="date" min={form.startDate} className={fieldClass} value={form.endDate} onChange={e => change('endDate', e.target.value)} /></Field>
      <Field label="Travelers"><input required type="number" min="1" max="100" className={fieldClass} value={form.groupSize} onChange={e => change('groupSize', Number(e.target.value))} /></Field>
      {agent ? <Field label="Registered traveler email"><input required disabled={Boolean(booking)} type="email" className={fieldClass} value={form.travelerEmail} onChange={e => change('travelerEmail', e.target.value)} /></Field>
        : <Field label="Choose your travel agent"><select required className={fieldClass} value={form.agentId} onChange={e => change('agentId', e.target.value)}><option value="">Select an agent</option>{agents.data.map(a => <option key={a._id} value={a._id}>{a.fullName}</option>)}</select></Field>}
    </div>
    {!agent && (agents.error || (!agents.loading && !agents.data.length)) && <Notice error>{agents.error || 'No agents have registered yet. Please try again later.'}</Notice>}
    {agent && <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Status"><select className={fieldClass} value={form.status} onChange={e => change('status', e.target.value)}>{['Confirmed', 'Pending Payment', 'Action Required', 'Cancelled'].map(status => <option key={status}>{status}</option>)}</select></Field>
        <Field label="Total amount (USD)"><input type="number" min="0" step="0.01" required className={fieldClass} value={form.amount} onChange={e => change('amount', Number(e.target.value))} /></Field>
        <Field label="Fully paid on (leave blank if unpaid)"><input type="date" className={fieldClass} value={form.paidAt} onChange={e => change('paidAt', e.target.value)} /></Field>
      </div>
      <Field label="Trip highlight"><input className={fieldClass} value={form.highlightTitle} onChange={e => change('highlightTitle', e.target.value)} /></Field>
      <Field label="Highlight description"><textarea className={fieldClass} value={form.highlightDescription} onChange={e => change('highlightDescription', e.target.value)} /></Field>
      <h3 className="text-[22px] font-bold my-4">Day-by-day schedule</h3>
      {form.schedule.map((item, index) => <div key={index} className="border border-[#e2e2e7] rounded-lg p-4 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <Field label="Day"><input type="number" min="1" max="90" required className={fieldClass} value={item.day} onChange={e => activityChange(index, 'day', Number(e.target.value))} /></Field>
          <Field label="Time (Sri Lanka)"><input type="time" required className={fieldClass} value={item.time} onChange={e => activityChange(index, 'time', e.target.value)} /></Field>
          <Field label="Live status"><select className={fieldClass} value={item.status} onChange={e => activityChange(index, 'status', e.target.value)}>{['future', 'active', 'past'].map(status => <option key={status}>{status}</option>)}</select></Field>
        </div>
        <Field label="Activity / reservation"><input required className={fieldClass} value={item.title} onChange={e => activityChange(index, 'title', e.target.value)} /></Field>
        <Field label="Description / milestones"><textarea className={fieldClass} value={item.description} onChange={e => activityChange(index, 'description', e.target.value)} /></Field>
        <label className="text-[13px] flex gap-2 mb-3"><input type="checkbox" checked={item.reservation} onChange={e => activityChange(index, 'reservation', e.target.checked)} />Reservation</label>
        <Field label="Restaurant menu URL (HTTPS, optional)"><input type="url" className={fieldClass} value={item.menuUrl} onChange={e => activityChange(index, 'menuUrl', e.target.value)} /></Field>
        <button type="button" className="text-[#ba1a1a] text-[13px]" onClick={() => change('schedule', form.schedule.filter((_, i) => i !== index))}>Remove activity</button>
      </div>)}
      <button type="button" className="text-[#0058bc] text-[13px] mb-6" onClick={() => change('schedule', [...form.schedule, { day: 1, time: '09:00', title: '', description: '', status: 'future', reservation: false, menuUrl: '' }])}>+ Add activity or reservation</button>
    </>}
    <div className="flex gap-3"><button className={buttonClass} disabled={saving || (!agent && !form.agentId)}>{saving ? 'Saving…' : agent ? 'Save trip' : 'Send trip request'}</button></div>
  </form>;
}

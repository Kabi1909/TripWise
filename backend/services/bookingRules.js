const destinations = {
  colombo: { name: 'Colombo', lat: 6.9271, lon: 79.8612 },
  'mirissa-galle': { name: 'Mirissa & Galle Coast', lat: 5.9485, lon: 80.4718 },
  sigiriya: { name: 'Sigiriya', lat: 7.957, lon: 80.7603 },
  ella: { name: 'Ella', lat: 6.8667, lon: 81.0466 },
};
const statuses = ['Confirmed', 'Pending Payment', 'Action Required', 'Cancelled'];
const scope = (user) => user.role === 'Travel Agent' ? { agentId: user.id } : { travelerId: user.id };
function fail(message) { throw Object.assign(new Error(message), { status: 400 }); }
function text(value, name, max = 200) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) fail('Invalid ' + name);
  return value.trim();
}
function date(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
      !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value) fail('Invalid travel date');
  return value;
}
function safeUrl(value) {
  if (!value) return '';
  try {
    const url = new URL(value);
    if (url.protocol === 'https:' && !url.username && !url.password) return url.href;
  } catch {}
  fail('Menu links must use HTTPS');
}
function bookingInput(body, agent = false) {
  if (!Object.hasOwn(destinations, body.destinationId)) fail('Choose a supported destination');
  const startDate = date(body.startDate), endDate = date(body.endDate);
  const days = (Date.parse(endDate) - Date.parse(startDate)) / 86400000 + 1;
  if (days < 1 || days > 90) fail('Trips must last between 1 and 90 days');
  if (!Number.isInteger(body.groupSize) || body.groupSize < 1 || body.groupSize > 100) fail('Group size must be 1–100');
  const result = {
    destinationId: body.destinationId, destination: destinations[body.destinationId].name,
    startDate, endDate, dates: startDate + ' – ' + endDate, groupSize: body.groupSize,
    packageName: typeof body.packageName === 'string' ? body.packageName.slice(0, 200) : '',
    title: text(body.title || destinations[body.destinationId].name + ' Adventure', 'title'),
  };
  if (agent) {
    if (!statuses.includes(body.status)) fail('Invalid booking status');
    if (typeof body.amount !== 'number' || !Number.isFinite(body.amount) || body.amount < 0) fail('Invalid amount');
    result.status = body.status;
    result.amount = body.amount;
    if (body.paidAt) {
      if (!Number.isFinite(Date.parse(body.paidAt))) fail('Invalid payment date');
      result.paidAt = new Date(body.paidAt);
    } else result.paidAt = null;
    result.highlightTitle = typeof body.highlightTitle === 'string' ? body.highlightTitle.slice(0, 200) : '';
    result.highlightDescription = typeof body.highlightDescription === 'string' ? body.highlightDescription.slice(0, 2000) : '';
    if (!Array.isArray(body.schedule) || body.schedule.length > 300) fail('Invalid schedule');
    result.schedule = body.schedule.map((item) => {
      if (!Number.isInteger(item.day) || item.day < 1 || item.day > days) fail('Activity day is outside the trip dates');
      if (typeof item.time !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(item.time)) fail('Activity time must use HH:MM');
      if (!['past', 'active', 'future'].includes(item.status)) fail('Invalid activity status');
      return { day: item.day, time: item.time, title: text(item.title, 'activity title'),
        description: typeof item.description === 'string' ? item.description.slice(0, 2000) : '',
        status: item.status, reservation: item.reservation === true, menuUrl: safeUrl(item.menuUrl) };
    }).sort((a, b) => a.day - b.day || a.time.localeCompare(b.time));
  }
  return result;
}
function metrics(bookings, now = new Date()) {
  const month = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1);
  const first = new Map();
  for (const booking of bookings) {
    const key = String(booking.travelerId?._id || booking.travelerId);
    const timestamp = new Date(booking.createdAt).getTime();
    first.set(key, Math.min(first.get(key) ?? Infinity, timestamp));
  }
  return {
    activeBookings: bookings.filter(b => b.status !== 'Cancelled' && b.endDate >= now.toISOString().slice(0, 10)).length,
    monthlyRevenue: bookings.filter(b => b.status !== 'Cancelled' && b.paidAt && new Date(b.paidAt).getTime() >= month && new Date(b.paidAt) <= now).reduce((sum, b) => sum + b.amount, 0),
    newClients: [...first.values()].filter(time => time >= now.getTime() - 30 * 86400000 && time <= now.getTime()).length,
  };
}
module.exports = { destinations, statuses, scope, bookingInput, metrics, text, fail };

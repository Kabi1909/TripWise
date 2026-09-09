const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const { bookingInput, scope, metrics } = require('../services/bookingRules');
const { installFixtures, ids } = require('./fixtures');
process.env.JWT_SECRET = 'test-only-secret-for-isolated-portal-tests';
const fixtures = installFixtures();
const app = require('../app');
let server, base;
before(async () => {
  server = await new Promise(resolve => { const value = app.listen(0, '127.0.0.1', () => resolve(value)); });
  base = 'http://127.0.0.1:' + server.address().port + '/api';
});
after(async () => { await new Promise(resolve => server.close(resolve)); fixtures.restore(); });
async function request(path, actor, method = 'GET', body) {
  const response = await fetch(base + path, { method, headers: { 'Content-Type': 'application/json',
    ...(actor ? { Authorization: 'Bearer ' + jwt.sign({ id: ids[actor] }, process.env.JWT_SECRET) } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body) });
  return { status: response.status, body: await response.json() };
}
const draft = { destinationId: 'ella', startDate: '2026-10-10', endDate: '2026-10-12', groupSize: 2 };
test('anonymous callers cannot read private APIs', async () => {
  for (const path of ['/bookings', '/messages', '/portal/history', '/portal/clients', '/itinerary/colombo'])
    assert.equal((await request(path)).status, 401, path);
});
test('travelers cannot use agent metrics, client directory, or booking edits', async () => {
  assert.equal((await request('/bookings/metrics', 'traveler')).status, 403);
  assert.equal((await request('/portal/clients', 'traveler')).status, 403);
  assert.equal((await request('/bookings/' + ids.booking, 'traveler', 'PATCH', { status: 'Confirmed' })).status, 403);
});
test('trip reads are isolated for both roles', async () => {
  assert.equal((await request('/bookings/' + ids.booking, 'traveler')).status, 200);
  assert.equal((await request('/bookings/' + ids.booking, 'agent')).status, 200);
  assert.equal((await request('/bookings/' + ids.booking, 'otherTraveler')).status, 404);
  assert.equal((await request('/bookings/' + ids.booking, 'otherAgent')).status, 404);
  assert.equal((await request('/bookings', 'otherAgent')).body.length, 0);
});
test('email login normalizes input and rejects wrong credentials', async () => {
  const login = await request('/auth/login', null, 'POST', { email: ' TRAVELER@EXAMPLE.TEST ', password: 'TripWiseTest123!' });
  assert.equal(login.status, 200); assert.equal(login.body.role, 'Traveler'); assert.ok(login.body.token); assert.equal(login.body.password, undefined);
  assert.equal((await request('/auth/login', null, 'POST', { email: 'traveler@example.test', password: 'wrong' })).status, 401);
});
test('registration rejects invalid roles and weak passwords', async () => {
  assert.equal((await request('/auth/register', null, 'POST', { fullName: 'Example', email: 'new@example.test', password: 'short' })).status, 400);
  assert.equal((await request('/auth/register', null, 'POST', { fullName: 'Example', email: 'new@example.test', password: 'ValidPass123', role: 'Admin' })).status, 400);
});
test('traveler requests cannot spoof owner, price, status, or schedule', async () => {
  const result = await request('/bookings', 'traveler', 'POST', { ...draft, agentId: ids.agent, travelerId: ids.otherTraveler,
    status: 'Confirmed', amount: 999, schedule: [{ title: 'forged' }] });
  assert.equal(result.status, 201);
  assert.equal(result.body.travelerId, ids.traveler); assert.equal(result.body.status, 'Action Required');
  assert.equal(result.body.amount, 0); assert.equal(result.body.schedule.length, 0);
});
test('agent cannot modify a different agent’s trip', async () => {
  assert.equal((await request('/bookings/' + ids.booking, 'otherAgent', 'PATCH', { status: 'Cancelled' })).status, 404);
});
test('assigned agent updates itinerary and traveler sees saved changes', async () => {
  assert.equal((await request('/bookings/' + ids.booking, 'agent', 'PATCH', { highlightTitle: 'Updated highlight' })).status, 200);
  assert.equal((await request('/bookings/' + ids.booking, 'traveler')).body.highlightTitle, 'Updated highlight');
});
test('messages derive recipient from assigned trip; outsiders cannot send or read', async () => {
  const sent = await request('/messages', 'traveler', 'POST', { bookingId: ids.booking, recipientId: ids.otherAgent, message: 'Test message' });
  assert.equal(sent.status, 201); assert.equal(sent.body.recipientId, ids.agent);
  assert.equal((await request('/messages', 'otherTraveler', 'POST', { bookingId: ids.booking, message: 'Intrusion' })).status, 404);
  assert.equal((await request('/messages', 'otherAgent')).body.length, 0);
  assert.equal((await request('/messages/' + sent.body._id + '/read', 'traveler', 'PATCH')).status, 404);
  assert.equal((await request('/messages/' + sent.body._id + '/read', 'agent', 'PATCH')).body.unread, false);
  assert.equal((await request('/messages', 'agent', 'POST', { bookingId: ids.booking, message: 'Reply' })).body.recipientId, ids.traveler);
});
test('history is private and ignores submitted owner', async () => {
  await request('/portal/history', 'traveler', 'POST', { kind: 'destination', title: 'Ella', userId: ids.otherTraveler });
  assert.equal((await request('/portal/history', 'traveler')).body.length, 1);
  assert.equal((await request('/portal/history', 'otherTraveler')).body.length, 0);
});
test('missing OAuth configuration returns a clear error, not fake sign-in', async () => {
  assert.equal((await request('/auth/oauth/google/start', null, 'POST', { challenge: 'x'.repeat(43) })).status, 503);
});
test('invalid travel dates, sizes, schedule days, and menu protocols are rejected', () => {
  for (const changes of [{ startDate: '2026-02-30' }, { endDate: '2026-01-01' }, { groupSize: 0 }, { groupSize: 1.5 }, { destinationId: '__proto__' }])
    assert.throws(() => bookingInput({ ...draft, ...changes }));
  const input = { ...draft, status: 'Confirmed', amount: 1, schedule: [{ day: 1, time: '09:00', title: 'Visit', status: 'future' }] };
  assert.equal(bookingInput(input, true).schedule.length, 1);
  assert.throws(() => bookingInput({ ...input, schedule: [{ ...input.schedule[0], day: 4 }] }, true));
  assert.throws(() => bookingInput({ ...input, schedule: [{ ...input.schedule[0], menuUrl: 'javascript:alert(1)' }] }, true));
});
test('metrics exclude cancelled, unpaid, out-of-month payments, and repeat clients', () => {
  const rows = [
    { travelerId: 'a', createdAt: '2026-08-01', status: 'Confirmed', endDate: '2026-10-01', paidAt: '2026-09-01', amount: 100 },
    { travelerId: 'a', createdAt: '2026-09-01', status: 'Confirmed', endDate: '2026-10-01', paidAt: null, amount: 200 },
    { travelerId: 'b', createdAt: '2026-09-01', status: 'Cancelled', endDate: '2026-10-01', paidAt: '2026-09-01', amount: 300 },
    { travelerId: 'c', createdAt: '2026-08-01', status: 'Confirmed', endDate: '2026-08-01', paidAt: '2026-08-01', amount: 400 },
  ];
  assert.deepEqual(metrics(rows, new Date('2026-09-08')), { activeBookings: 2, monthlyRevenue: 100, newClients: 1 });
  assert.deepEqual(scope({ role: 'Traveler', id: 'a' }), { travelerId: 'a' });
});

test('OAuth verifies signed identity, binds exchange to initiating browser, and rejects replay', async () => {
  const crypto = require('node:crypto');
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'test-key', use: 'sig', alg: 'RS256' };
  const originalFetch = global.fetch;
  process.env.GOOGLE_CLIENT_ID = 'test-google-client';
  process.env.GOOGLE_CLIENT_SECRET = 'test-google-secret';
  let identityToken;
  global.fetch = async (url, options) => {
    if (String(url) === 'https://oauth2.googleapis.com/token') return Response.json({ id_token: identityToken });
    if (String(url) === 'https://www.googleapis.com/oauth2/v3/certs') return Response.json({ keys: [jwk] });
    return originalFetch(url, options);
  };
  try {
    const verifier = crypto.randomBytes(32).toString('base64url');
    const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
    const start = await request('/auth/oauth/google/start', null, 'POST', { challenge, role: 'Traveler' });
    assert.equal(start.status, 200);
    const url = new URL(start.body.url);
    assert.equal(url.searchParams.get('code_challenge_method'), 'S256');
    identityToken = jwt.sign({ sub: 'test-provider-subject', email: 'oauth@example.test', email_verified: true,
      nonce: url.searchParams.get('nonce'), name: 'OAuth Test' }, privateKey,
      { algorithm: 'RS256', keyid: 'test-key', audience: 'test-google-client', issuer: 'https://accounts.google.com', expiresIn: '5m' });
    const callback = await originalFetch(base + '/auth/oauth/google/callback?code=test-code&state=' + url.searchParams.get('state'), { redirect: 'manual' });
    assert.equal(callback.status, 302);
    const ticket = new URLSearchParams(new URL(callback.headers.get('location')).hash.slice(1)).get('code');
    assert.ok(ticket);
    assert.equal((await request('/auth/oauth/exchange', null, 'POST', { code: ticket, verifier: 'wrong-browser' })).status, 401);
    const exchange = await request('/auth/oauth/exchange', null, 'POST', { code: ticket, verifier });
    assert.equal(exchange.status, 200); assert.equal(exchange.body.email, 'oauth@example.test');
    assert.equal((await request('/auth/oauth/exchange', null, 'POST', { code: ticket, verifier })).status, 401);
    const retry = await originalFetch(base + '/auth/oauth/google/callback?code=test-code&state=' + url.searchParams.get('state'), { redirect: 'manual' });
    assert.match(retry.headers.get('location'), /error=/);
    const invalidStart = await request('/auth/oauth/google/start', null, 'POST', { challenge });
    const invalidUrl = new URL(invalidStart.body.url);
    identityToken = jwt.sign({ sub: 'bad', email: 'bad@example.test', email_verified: true, nonce: 'wrong-nonce' }, privateKey,
      { algorithm: 'RS256', keyid: 'test-key', audience: 'test-google-client', issuer: 'https://accounts.google.com', expiresIn: '5m' });
    const invalid = await originalFetch(base + '/auth/oauth/google/callback?code=bad&state=' + invalidUrl.searchParams.get('state'), { redirect: 'manual' });
    assert.match(invalid.headers.get('location'), /error=/);
  } finally { global.fetch = originalFetch; delete process.env.GOOGLE_CLIENT_ID; delete process.env.GOOGLE_CLIENT_SECRET; }
});
test('live intelligence degrades honestly when upstream providers fail', async () => {
  const originalFetch = global.fetch;
  global.fetch = async (url, options) => {
    if (String(url).startsWith('https://api.open-meteo.com') || String(url).startsWith('https://api.frankfurter.dev')) throw new Error('Provider offline');
    return originalFetch(url, options);
  };
  try {
    const result = await request('/intel/sigiriya');
    assert.equal(result.status, 200); assert.equal(result.body.weather.available, false);
    assert.equal(result.body.exchangeRate.available, false);
    assert.equal(result.body.exchangeRate.rate, 'Unavailable');
  } finally { global.fetch = originalFetch; }
});

test('notifications are recipient-only in both directions and clear when read', async () => {
  assert.equal((await request('/messages/notifications')).status, 401);
  const agentBefore = (await request('/messages/notifications', 'agent')).body.count;
  const travelerBefore = (await request('/messages/notifications', 'traveler')).body.count;
  const outgoing = await request('/messages', 'traveler', 'POST', { bookingId: ids.booking, message: 'Notification test for agent' });
  const agent = await request('/messages/notifications', 'agent');
  assert.equal(agent.body.count, agentBefore + 1);
  assert.ok(agent.body.messages.some(m => m._id === outgoing.body._id));
  assert.equal((await request('/messages/notifications', 'traveler')).body.count, travelerBefore);
  assert.equal((await request('/messages/notifications', 'otherAgent')).body.count, 0);
  await request('/messages/' + outgoing.body._id + '/read', 'agent', 'PATCH');
  assert.equal((await request('/messages/notifications', 'agent')).body.count, agentBefore);
  const reply = await request('/messages', 'agent', 'POST', { bookingId: ids.booking, message: 'Notification test for traveler' });
  assert.equal((await request('/messages/notifications', 'traveler')).body.count, travelerBefore + 1);
  assert.equal((await request('/messages/notifications', 'otherTraveler')).body.count, 0);
  await request('/messages/' + reply.body._id + '/read', 'traveler', 'PATCH');
  assert.equal((await request('/messages/notifications', 'traveler')).body.count, travelerBefore);
});

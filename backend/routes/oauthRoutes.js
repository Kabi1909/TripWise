const router = require('express').Router();
const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
const Attempt = require('../models/OAuthAttempt');
const User = require('../models/User');
const { session } = require('../controllers/authController');
const frontend = () => process.env.FRONTEND_URL || 'http://localhost:5173';
const random = () => crypto.randomBytes(32).toString('base64url');
const hash = value => crypto.createHash('sha256').update(value).digest('base64url');
function config(provider) {
  const configs = {
    google: { client: process.env.GOOGLE_CLIENT_ID, secret: process.env.GOOGLE_CLIENT_SECRET,
      authorize: 'https://accounts.google.com/o/oauth2/v2/auth', token: 'https://oauth2.googleapis.com/token',
      keys: 'https://www.googleapis.com/oauth2/v3/certs', issuer: ['https://accounts.google.com', 'accounts.google.com'] },
    apple: { client: process.env.APPLE_CLIENT_ID, secret: process.env.APPLE_CLIENT_SECRET,
      authorize: 'https://appleid.apple.com/auth/authorize', token: 'https://appleid.apple.com/auth/token',
      keys: 'https://appleid.apple.com/auth/keys', issuer: 'https://appleid.apple.com' },
  };
  const c = Object.hasOwn(configs, provider) ? configs[provider] : null;
  if (!c?.client || !c.secret) throw Object.assign(new Error('This sign-in provider is not configured yet. Please use email.'), { status: 503 });
  c.callback = (process.env.BACKEND_URL || 'http://localhost:5000') + '/api/auth/oauth/' + provider + '/callback';
  return c;
}
router.post('/:provider/start', async (req, res) => {
  const provider = req.params.provider, c = config(provider);
  if (typeof req.body.challenge !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(req.body.challenge))
    return res.status(400).json({ message: 'Invalid sign-in challenge' });
  const state = random(), nonce = random(), verifier = random();
  await Attempt.create({ key: hash(state), provider, nonce, verifier, challenge: req.body.challenge,
    role: req.body.role === 'Travel Agent' ? 'Travel Agent' : 'Traveler', expiresAt: new Date(Date.now() + 600000) });
  const url = new URL(c.authorize);
  url.search = new URLSearchParams({ client_id: c.client, redirect_uri: c.callback, response_type: 'code',
    scope: provider === 'google' ? 'openid email profile' : 'name email', state, nonce,
    ...(provider === 'apple' ? { response_mode: 'form_post' } : { code_challenge: hash(verifier), code_challenge_method: 'S256' }) });
  res.json({ url: url.href });
});
async function callback(req, res) {
  const errorRedirect = message => res.redirect(frontend() + '/oauth/callback#error=' + encodeURIComponent(message));
  try {
    const provider = req.params.provider, c = config(provider);
    const input = req.method === 'POST' ? req.body : req.query;
    if (typeof input.state !== 'string') return errorRedirect('Invalid sign-in state');
    const attempt = await Attempt.findOneAndDelete({ key: hash(input.state), provider, expiresAt: { $gt: new Date() } });
    if (!attempt) return errorRedirect('Sign-in expired. Please try again.');
    if (input.error || typeof input.code !== 'string') return errorRedirect('Sign-in was cancelled.');
    const response = await fetch(c.token, { method: 'POST', signal: AbortSignal.timeout(10000),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: c.client, client_secret: c.secret, code: input.code,
        grant_type: 'authorization_code', redirect_uri: c.callback, ...(provider === 'google' ? { code_verifier: attempt.verifier } : {}) }) });
    if (!response.ok) throw new Error('Provider rejected sign-in');
    const tokens = await response.json();
    const header = jwt.decode(tokens.id_token, { complete: true })?.header;
    if (header?.alg !== 'RS256') throw new Error('Invalid identity token');
    const keysResponse = await fetch(c.keys, { signal: AbortSignal.timeout(10000) });
    if (!keysResponse.ok) throw new Error('Cannot verify provider');
    const keys = await keysResponse.json();
    const jwk = keys.keys.find(k => k.kid === header.kid && k.kty === 'RSA');
    if (!jwk) throw new Error('Unknown signing key');
    const identity = jwt.verify(tokens.id_token, crypto.createPublicKey({ key: jwk, format: 'jwk' }),
      { algorithms: ['RS256'], audience: c.client, issuer: c.issuer });
    if (identity.nonce !== attempt.nonce || !identity.sub || !identity.exp ||
        ![true, 'true'].includes(identity.email_verified) || typeof identity.email !== 'string') throw new Error('Identity not verified');
    let user = await User.findOne({ oauthProvider: provider, oauthSubject: identity.sub });
    if (!user) {
      const email = identity.email.toLowerCase();
      if (await User.exists({ email })) return errorRedirect('This email already has an account. Sign in using its original method.');
      user = await User.create({ fullName: identity.name || email.split('@')[0], email, role: attempt.role,
        oauthProvider: provider, oauthSubject: identity.sub });
    }
    const ticket = random();
    await Attempt.create({ key: hash(ticket), userId: user._id, challenge: attempt.challenge, expiresAt: new Date(Date.now() + 60000) });
    res.redirect(frontend() + '/oauth/callback#code=' + encodeURIComponent(ticket));
  } catch {
    errorRedirect('Unable to complete provider sign-in. Please try again or use email.');
  }
}
router.get('/:provider/callback', callback);
router.post('/:provider/callback', callback);
router.post('/exchange', async (req, res) => {
  const { code, verifier } = req.body;
  if (typeof code !== 'string' || typeof verifier !== 'string' || verifier.length > 200) return res.status(400).json({ message: 'Invalid sign-in exchange' });
  const attempt = await Attempt.findOneAndDelete({ key: hash(code), challenge: hash(verifier), userId: { $exists: true }, expiresAt: { $gt: new Date() } });
  if (!attempt) return res.status(401).json({ message: 'Sign-in expired or opened in a different browser tab' });
  const user = await User.findById(attempt.userId);
  if (!user) return res.status(401).json({ message: 'Account no longer exists' });
  res.json(session(user));
});
module.exports = router;

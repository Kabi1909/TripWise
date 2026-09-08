const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
function session(user) {
  return { _id: user._id, fullName: user.fullName, email: user.email, role: user.role,
    token: jwt.sign({ id: user._id }, process.env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '1d' }) };
}
async function registerUser(req, res) {
  const { fullName, email, password, role = 'Traveler' } = req.body;
  if (typeof fullName !== 'string' || !fullName.trim() || fullName.length > 100 ||
      typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password) > 72 ||
      !['Traveler', 'Travel Agent'].includes(role))
    return res.status(400).json({ message: 'Enter a name, valid email, role, and password of 8–72 bytes.' });
  const normalized = email.trim().toLowerCase();
  if (await User.exists({ email: normalized })) return res.status(409).json({ message: 'An account with this email already exists' });
  const user = await User.create({ fullName: fullName.trim(), email: normalized, password: await bcrypt.hash(password, 12), role });
  res.status(201).json(session(user));
}
async function loginUser(req, res) {
  const { email, password } = req.body;
  if (typeof email !== 'string' || typeof password !== 'string' || Buffer.byteLength(password) > 72)
    return res.status(400).json({ message: 'Invalid credentials' });
  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user?.password || !await bcrypt.compare(password, user.password))
    return res.status(401).json({ message: 'Invalid credentials' });
  res.json(session(user));
}
module.exports = { registerUser, loginUser, session };

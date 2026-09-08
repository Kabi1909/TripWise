const jwt = require('jsonwebtoken');
const User = require('../models/User');
async function protect(req, res, next) {
  const token = req.headers.authorization?.match(/^Bearer (\S+)$/)?.[1];
  if (!token) return res.status(401).json({ message: 'Please sign in' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    const user = await User.findById(decoded.id).select('_id role fullName email');
    if (!user) return res.status(401).json({ message: 'Account no longer exists' });
    req.user = { id: String(user._id), role: user.role, fullName: user.fullName, email: user.email };
    next();
  } catch {
    res.status(401).json({ message: 'Session expired. Please sign in again.' });
  }
}
function agentOnly(req, res, next) {
  if (req.user.role !== 'Travel Agent') return res.status(403).json({ message: 'Agent access required' });
  next();
}
module.exports = { protect, agentOnly };

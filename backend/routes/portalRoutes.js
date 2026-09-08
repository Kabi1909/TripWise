const router = require('express').Router();
const { protect, agentOnly } = require('../middleware/authMiddleware');
const User = require('../models/User');
const Booking = require('../models/Booking');
const History = require('../models/History');
const { text, fail } = require('../services/bookingRules');
router.use(protect);
router.get('/agents', async (req, res) => res.json(await User.find({ role: 'Travel Agent' }).select('fullName').sort({ fullName: 1 })));
router.get('/clients', agentOnly, async (req, res) => {
  const bookings = await Booking.find({ agentId: req.user.id }).populate('travelerId', 'fullName email').sort({ createdAt: -1 }).lean();
  const clients = new Map();
  for (const booking of bookings) {
    if (!booking.travelerId) continue;
    const key = String(booking.travelerId._id);
    if (!clients.has(key)) clients.set(key, { ...booking.travelerId, bookings: [] });
    clients.get(key).bookings.push({ _id: booking._id, destination: booking.destination, dates: booking.dates, status: booking.status });
  }
  res.json([...clients.values()]);
});
router.get('/history', async (req, res) => res.json(await History.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(100)));
router.post('/history', async (req, res) => {
  if (!['destination', 'package', 'search', 'flight'].includes(req.body.kind)) fail('Invalid history type');
  res.status(201).json(await History.create({ userId: req.user.id, kind: req.body.kind,
    title: text(req.body.title, 'title'), details: typeof req.body.details === 'string' ? req.body.details.slice(0, 1000) : '',
    destinationId: typeof req.body.destinationId === 'string' ? req.body.destinationId.slice(0, 40) : '' }));
});
module.exports = router;

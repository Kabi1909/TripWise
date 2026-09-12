const Booking = require('../models/Booking');
const User = require('../models/User');
const { scope, bookingInput, metrics, fail } = require('../services/bookingRules');
async function getBookings(req, res) {
  res.json(await Booking.find(scope(req.user)).sort({ createdAt: -1 }).populate('travelerId agentId', 'fullName email'));
}
async function createBooking(req, res) {
  const agent = req.user.role === 'Travel Agent';
  const input = bookingInput(req.body, agent);
  const traveler = agent
    ? await User.findOne({ email: String(req.body.travelerEmail || '').trim().toLowerCase(), role: 'Traveler' })
    : await User.findById(req.user.id);
  const assignedAgent = agent ? await User.findById(req.user.id) : await User.findOne({ _id: req.body.agentId, role: 'Travel Agent' });
  if (!traveler || !assignedAgent) fail('Choose an agent and an existing traveler account');
  const booking = await Booking.create({ ...input, allocationUnread: !agent, travelerId: traveler._id, agentId: assignedAgent._id,
    clientName: traveler.fullName, clientInitials: traveler.fullName.split(/\s+/).map(s => s[0]).slice(0, 2).join('').toUpperCase() });
  res.status(201).json(booking);
}
async function getBooking(req, res) {
  const booking = await Booking.findOne({ _id: req.params.id, ...scope(req.user) }).populate('travelerId agentId', 'fullName email');
  if (!booking) return res.status(404).json({ message: 'Trip not found' });
  res.json(booking);
}
async function updateBooking(req, res) {
  const booking = await Booking.findOne({ _id: req.params.id, ...scope(req.user) });
  if (!booking) return res.status(404).json({ message: 'Trip not found' });
  const input = bookingInput({ ...booking.toObject(), ...req.body }, true);
  Object.assign(booking, input);
  await booking.save();
  res.json(booking);
}
async function getMetrics(req, res) {
  const bookings = await Booking.find(scope(req.user)).lean();
  res.json({ ...metrics(bookings), updatedAt: new Date(), currency: 'USD' });
}
module.exports = { getBookings, createBooking, getBooking, updateBooking, getMetrics };

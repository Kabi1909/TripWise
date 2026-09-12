const Message = require('../models/Message');
const Booking = require('../models/Booking');
const { scope, text } = require('../services/bookingRules');
async function getMessages(req, res) {
  const filter = { $or: [{ senderId: req.user.id }, { recipientId: req.user.id }] };
  if (req.query.bookingId) filter.bookingId = req.query.bookingId;
  res.json(await Message.find(filter).sort({ createdAt: -1 }).limit(200));
}
async function getNotifications(req, res) {
  const filter = { recipientId: req.user.id, unread: true };
  const [count, messages] = await Promise.all([
    Message.countDocuments(filter),
    Message.find(filter).sort({ createdAt: -1 }).limit(20),
  ]);
  const allocationFilter = { agentId: req.user.id, allocationUnread: true };
  const [allocationCount, bookings] = req.user.role === 'Travel Agent'
    ? await Promise.all([
      Booking.countDocuments(allocationFilter),
      Booking.find(allocationFilter).sort({ createdAt: -1 }).limit(20),
    ]) : [0, []];
  const allocations = bookings.map(booking => ({
    _id: 'allocation:' + booking._id,
    kind: 'trip-allocation',
    bookingId: booking._id,
    senderName: booking.clientName,
    message: booking.clientName + ' requested ' + booking.title + ' (' + booking.startDate + ' to ' + booking.endDate + ').',
    createdAt: booking.createdAt,
  }));
  const notifications = [...messages.map(message => ({ ...message.toObject(), kind: 'message' })), ...allocations]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt) || String(b._id).localeCompare(String(a._id)))
    .slice(0, 20);
  res.json({ count: count + allocationCount, messages: notifications });
}
async function sendMessage(req, res) {
  const booking = await Booking.findOne({ _id: req.body.bookingId, ...scope(req.user) });
  if (!booking) return res.status(404).json({ message: 'Trip not found' });
  const recipientId = req.user.role === 'Travel Agent' ? booking.travelerId : booking.agentId;
  const message = await Message.create({ bookingId: booking._id, senderId: req.user.id, recipientId,
    senderName: req.user.fullName, senderInitials: req.user.fullName.split(/\s+/).map(s => s[0]).slice(0, 2).join(''),
    message: text(req.body.message, 'message', 4000) });
  res.status(201).json(message);
}
async function readMessage(req, res) {
  const message = await Message.findOneAndUpdate({ _id: req.params.id, recipientId: req.user.id }, { unread: false }, { new: true });
  if (!message) return res.status(404).json({ message: 'Message not found' });
  res.json(message);
}
module.exports = { getMessages, getNotifications, sendMessage, readMessage };

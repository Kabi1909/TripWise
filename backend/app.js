const express = require('express');
const cors = require('cors');
const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: false, limit: '20kb' }));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/itinerary', require('./routes/itineraryRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/portal', require('./routes/portalRoutes'));
app.use('/api/intel', require('./routes/intelRoutes'));
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status = error.status || (error.code === 11000 ? 409 : ['ValidationError', 'CastError'].includes(error.name) ? 400 : 500);
  res.status(status).json({ message: status === 500 ? 'Server error. Please try again.' : error.code === 11000 ? 'Account already exists' : error.message });
});
module.exports = app;

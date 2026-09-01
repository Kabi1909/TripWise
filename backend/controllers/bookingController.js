const Booking = require('../models/Booking');

const getBookings = async (req, res) => {
  try {
    let bookings = await Booking.find();
    if (bookings.length === 0) {
      // Seed default Sri Lanka & global mock data matching UI
      bookings = await Booking.insertMany([
        { clientName: 'John Doe', clientInitials: 'JD', destination: 'Colombo & Galle, Sri Lanka', dates: 'Nov 12 - Nov 20', status: 'Confirmed', amount: 1450 },
        { clientName: 'Alice Smith', clientInitials: 'AS', destination: 'Ella & Kandy, Sri Lanka', dates: 'Dec 05 - Dec 10', status: 'Pending Payment', amount: 980 },
        { clientName: 'Bruce Wayne', clientInitials: 'BW', destination: 'Mirissa, Sri Lanka', dates: 'Jan 15 - Jan 25', status: 'Confirmed', amount: 3200 },
        { clientName: 'Clark Kent', clientInitials: 'CK', destination: 'Sigiriya & Dambulla', dates: 'Oct 26 - Nov 02', status: 'Action Required', amount: 1120 }
      ]);
    }
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createBooking = async (req, res) => {
  try {
    const booking = new Booking(req.body);
    const saved = await booking.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getBookings, createBooking }; 

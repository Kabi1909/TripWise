const { getBooking, getBookings } = require('./bookingController');
module.exports = { getItinerary: getBooking, getColomboItinerary: getBookings };

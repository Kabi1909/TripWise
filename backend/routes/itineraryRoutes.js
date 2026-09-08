const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { getBooking, getBookings } = require('../controllers/bookingController');
router.use(protect);
router.get('/colombo', getBookings);
router.get('/:id', getBooking);
module.exports = router;

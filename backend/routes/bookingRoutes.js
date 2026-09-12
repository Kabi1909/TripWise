const router = require('express').Router();
const { protect, agentOnly } = require('../middleware/authMiddleware');
const c = require('../controllers/bookingController');
router.use(protect);
router.get('/metrics', agentOnly, c.getMetrics);
router.route('/').get(c.getBookings).post(c.createBooking);
router.patch('/:id/allocation/read', agentOnly, c.readAllocation);
router.route('/:id').get(c.getBooking).patch(agentOnly, c.updateBooking);
module.exports = router;

const express = require('express');
const router = express.Router();
const { getColomboItinerary } = require('../controllers/itineraryController');

router.get('/colombo', getColomboItinerary);

module.exports = router; 

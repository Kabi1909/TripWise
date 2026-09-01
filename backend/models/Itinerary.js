const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema({
  title: { type: String, default: 'Colombo Masterclass' },
  client: { type: String, default: 'Neha' },
  clientType: { type: String, default: 'VIP Client' },
  activeDayText: { type: String, default: 'Day 3 of 7' },
  highlightTitle: { type: String, default: 'Exploring the Fort District' },
  highlightDescription: { 
    type: String, 
    default: 'Guided tour through colonial architecture, followed by a culinary masterclass at the Ministry of Crab.' 
  },
  weather: {
    temp: { type: String, default: '31°C' },
    city: { type: String, default: 'Colombo' },
    tip: { type: String, default: 'Monsoon season approaching. Advise client to carry an umbrella.' }
  },
  exchangeRate: {
    base: { type: String, default: '1 USD' },
    rate: { type: String, default: '315 LKR' }
  },
  schedule: [
    {
      time: String,
      title: String,
      description: String,
      status: { type: String, enum: ['past', 'active', 'future'], default: 'future' }
    }
  ]
});

module.exports = mongoose.model('Itinerary', itinerarySchema);

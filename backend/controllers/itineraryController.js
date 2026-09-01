const Itinerary = require('../models/Itinerary');

const getColomboItinerary = async (req, res) => {
  try {
    let itinerary = await Itinerary.findOne();
    if (!itinerary) {
      itinerary = await Itinerary.create({
        title: 'Colombo Masterclass',
        client: 'Neha',
        clientType: 'VIP Client',
        activeDayText: 'Day 3 of 7',
        highlightTitle: 'Exploring the Fort District',
        highlightDescription: 'Guided tour through colonial architecture, followed by a culinary masterclass at the Ministry of Crab.',
        weather: {
          temp: '31°C',
          city: 'Colombo',
          tip: 'Monsoon season approaching. Advise client to carry an umbrella.'
        },
        exchangeRate: {
          base: '1 USD',
          rate: '315 LKR'
        },
        schedule: [
          { time: '09:00 AM', title: 'Breakfast at Galle Face Hotel', description: 'Seafront dining experience', status: 'past' },
          { time: '11:30 AM (Now)', title: 'Fort District Guided Walk', description: 'Meeting guide at the Dutch Hospital Precinct.', status: 'active' },
          { time: '14:00 PM', title: 'Ministry of Crab Masterclass', description: 'Hands-on culinary session', status: 'future' }
        ]
      });
    }
    res.json(itinerary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getColomboItinerary }; 

const router = require('express').Router();
const { destinations } = require('../services/bookingRules');
const cache = new Map();
async function json(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error('Provider unavailable');
  return response.json();
}
router.get('/:destinationId', async (req, res) => {
  const destination = destinations[req.params.destinationId];
  if (!Object.hasOwn(destinations, req.params.destinationId)) return res.status(404).json({ message: 'Destination not found' });
  const cached = cache.get(req.params.destinationId);
  if (cached && Date.now() - cached.saved < 600000) return res.json(cached.data);
  const [weather, exchange] = await Promise.allSettled([
    json('https://api.open-meteo.com/v1/forecast?' + new URLSearchParams({
      latitude: destination.lat, longitude: destination.lon, current: 'temperature_2m,weather_code,precipitation', timezone: 'Asia/Colombo',
    })),
    json('https://api.frankfurter.dev/v2/rate/USD/LKR'),
  ]);
  const current = weather.status === 'fulfilled' ? weather.value.current : null;
  const rate = exchange.status === 'fulfilled' ? exchange.value : null;
  const validWeather = Number.isFinite(current?.temperature_2m) && Number.isFinite(current?.weather_code);
  const data = {
    weather: validWeather ? {
      temp: current.temperature_2m + '°C', city: destination.name, observedAt: current.time,
      tip: current.weather_code >= 95 ? 'Thunderstorms forecast. Consider indoor activities.'
        : current.precipitation > 0 || current.weather_code >= 51 ? 'Wet conditions forecast. Carry rain protection.'
        : current.weather_code >= 45 ? 'Visibility may be reduced. Take care when travelling.'
        : 'Check local conditions before outdoor activities.',
      source: 'https://open-meteo.com/', available: true,
    } : { temp: 'Unavailable', city: destination.name, tip: 'Weather service temporarily unavailable.', available: false },
    exchangeRate: Number.isFinite(rate?.rate) && rate.rate > 0
      ? { base: '1 USD', rate: rate.rate.toFixed(2) + ' LKR', date: rate.date, source: 'https://frankfurter.dev/', available: true }
      : { base: '1 USD', rate: 'Unavailable', available: false },
    updatedAt: new Date().toISOString(),
  };
  if (validWeather && data.exchangeRate.available) cache.set(req.params.destinationId, { saved: Date.now(), data });
  res.json(data);
});
module.exports = router;

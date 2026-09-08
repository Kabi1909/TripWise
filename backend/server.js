require('dotenv').config();
const connectDB = require('./config/db');
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('Set JWT_SECRET to a random value of at least 32 characters in backend/.env');
}
const app = require('./app');
connectDB().then(() => {
  const port = process.env.PORT || 5000;
  app.listen(port, () => console.log('Server running on port ' + port));
});

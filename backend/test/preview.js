// Isolated UI fixture server: never connects to MongoDB or sends external messages.
process.env.JWT_SECRET = 'test-only-secret-for-isolated-ui-preview';
process.env.FRONTEND_URL = 'http://localhost:5174';
const { installFixtures } = require('./fixtures');
installFixtures();
require('../app').listen(5001, '127.0.0.1', () => console.log('Isolated UI fixture API: http://127.0.0.1:5001'));

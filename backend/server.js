/**
 * server.js — ENTRY POINT of the backend.
 *
 * Job: load environment variables, connect to MongoDB, then start listening.
 * The Express app itself is defined in src/app.js (kept separate so that
 * automated tests can import the app WITHOUT starting a real server / DB).
 */
require('dotenv').config({ quiet: true });

// Safe defaults so the project still starts if someone forgets to create .env
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/foodbridge';
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'dev_only_secret_change_me';
  console.warn('⚠️  JWT_SECRET not set — using a development default. Set it in backend/.env');
}

const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 FoodBridge API running on http://localhost:${PORT}`);
    console.log(`   Health check:      http://localhost:${PORT}/api/health`);
    console.log(`   Vanilla JS page:   http://localhost:${PORT}/impact.html`);
  });
});

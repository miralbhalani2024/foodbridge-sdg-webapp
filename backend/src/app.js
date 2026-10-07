/**
 * app.js — creates and configures the Express application.
 *
 * REQUEST FLOW (important for viva):
 *   Client (React / Postman)
 *     → cors()            allow requests from the React dev server (different port)
 *     → express.json()    parse JSON request body into req.body
 *     → logger            our custom middleware: prints method, URL, status, time
 *     → router            matches URL + HTTP method to a controller function
 *     → controller        talks to MongoDB through Mongoose models
 *     → res.json()        sends JSON response back
 *     → errorHandler      any error thrown above ends up here
 */
const path = require('path');
const express = require('express');
const cors = require('cors');

const logger = require('./middleware/logger');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const donationRoutes = require('./routes/donationRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();

// ---------- Built-in & third-party middleware ----------
app.use(cors());
app.use(express.json());
app.use(logger);

// Serves files from /public, e.g. http://localhost:5000/impact.html
// (a plain HTML + CSS + JavaScript page — covers Modules 2 & 3 of the syllabus)
app.use(express.static(path.join(__dirname, '..', 'public')));

// ---------- API routes ----------
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'FoodBridge API', time: new Date().toISOString() });
});
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/stats', statsRoutes);

// ---------- Production: serve the built React app ----------
// After `npm run build` in /frontend, Express can serve the React files itself,
// so the whole project can be deployed as ONE server (see README → Deployment).
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', '..', 'frontend', 'dist');
  app.use(express.static(distPath));
  app.get(/^\/(?!api).*/, (req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

// ---------- Error handling (must be LAST) ----------
app.use(notFound);
app.use(errorHandler);

module.exports = app;

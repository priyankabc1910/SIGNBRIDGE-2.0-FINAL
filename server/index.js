// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// CORS + body parsers
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
try {
  const translationRoutes = require('./routes/translation');
  const historyRoutes = require('./routes/history');
  app.use('/api/translation', translationRoutes);
  app.use('/api/history', historyRoutes);
} catch (err) {
  console.error('❌ Route load failed: - index.js:21', err);
}

// Health-check route
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', message: 'SignBridge 2.0 API running' });
});

// Only start port locally; export for Vercel
if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`✅ Server running on port ${PORT} - index.js:32`));
}

module.exports = app;






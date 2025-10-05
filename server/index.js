




// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Detect serverless (Vercel) so we don't call listen() there
const isServerless =
  process.env.VERCEL === '1' ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.SERVERLESS === 'true';

// IMPORTANT: base path for routes
// - Local: '/api'  (so your frontend calls http://localhost:5000/api/...)
// - Vercel: ''     (because the serverless function itself lives under /api)
const BASE = process.env.BASE_PATH ?? (isServerless ? '' : '/api');

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
const translationRoutes = require('./routes/translation');
const historyRoutes     = require('./routes/history');

app.use(`${BASE}/translation`, translationRoutes);
app.use(`${BASE}/history`, historyRoutes);

// Health
app.get(`${BASE}/health`, (_req, res) => {
  res.json({ status: 'OK', message: 'SignBridge 2.0 API running' });
});

// (Optional) Serve React build when hosting both together on one host
if (process.env.SERVE_CLIENT === 'true') {
  const clientBuild = path.join(__dirname, '..', 'build');
  app.use(express.static(clientBuild));
  app.get('*', (_req, res) => res.sendFile(path.join(clientBuild, 'index.html')));
}

// Start only when not serverless
if (!isServerless) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`✅ Server running on port ${PORT} - index.js:52`));
}

module.exports = app;

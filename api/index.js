
// Minimal Vercel serverless entry for SignBridge 2.0
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Import your existing routes from /server
const translationRoutes = require('../server/routes/translation');
const historyRoutes     = require('../server/routes/history');

app.use('/api/translation', translationRoutes);
app.use('/api/history', historyRoutes);

// Health
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', message: 'SignBridge 2.0 API (Vercel) running' });
});

// DO NOT call app.listen() on Vercel—export the app:
module.exports = app;

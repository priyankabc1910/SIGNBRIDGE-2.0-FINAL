// server/app.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

require('dotenv').config();

const translationRoutes = require('./routes/translation');
const historyRoutes = require('./routes/history');

const app = express();

// CORS (loose for now; you can tighten later)
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

// Parsers
app.use(bodyParser.json({ limit: '2mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Sign Language Translator API is running' });
});

// Mount API under /api
app.use('/api/translation', translationRoutes);
app.use('/api/history', historyRoutes);

module.exports = app;

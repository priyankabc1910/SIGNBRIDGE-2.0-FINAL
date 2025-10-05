// server/index.js
// SignBridge 2.0 — unified entry: works for local (node/nodemon) AND serverless (Vercel)
// - Exports the Express app for serverless platforms
// - Listens on PORT when running as a standalone server
// - Can optionally serve the React build when SERVE_CLIENT=true

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS (permissive for dev; tighten in prod via env)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
  })
);

// Body parsers
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
const translationRoutes = require('./routes/translation');
const historyRoutes = require('./routes/history');

app.use('/api/translation', translationRoutes);
app.use('/api/history', historyRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'OK', message: 'SignBridge 2.0 API running' });
});

// (Optional) Serve React build if deploying both together on one host
if (process.env.SERVE_CLIENT === 'true') {
  const clientBuild = path.join(__dirname, '..', 'build');
  app.use(express.static(clientBuild));
  app.get('*', (_req, res) => res.sendFile(path.join(clientBuild, 'index.html')));
}

/**
 * Export the app for serverless (e.g., Vercel /api)
 * AND also start the server when running in a normal Node environment.
 * We avoid listening on serverless by checking common env flags.
 */
const isServerless =
  process.env.VERCEL === '1' ||
  process.env.AWS_LAMBDA_FUNCTION_NAME ||
  process.env.SERVERLESS === 'true';

if (!isServerless) {
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT} - index.js:57`);
  });
}

// Export for serverless platforms (Vercel will import this in /api handler)
module.exports = app;



// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

const translationRoutes = require('./routes/translation');
const historyRoutes = require('./routes/history');

app.use('/api/translation', translationRoutes);
app.use('/api/history', historyRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'SignBridge 2.0 API running' });
});

// (Optional) serve React build if deploying together
if (process.env.SERVE_CLIENT === 'true') {
  const clientBuild = path.join(__dirname, '..', 'build');
  app.use(express.static(clientBuild));
  app.get('*', (_req, res) => res.sendFile(path.join(clientBuild, 'index.html')));
}

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT} - index.js:33`));

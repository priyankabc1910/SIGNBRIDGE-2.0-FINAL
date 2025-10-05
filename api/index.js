// api/index.js
// Vercel will serve anything in /api/* as serverless functions.
// Exporting an Express app works out of the box.
const app = require('../server/app');
module.exports = app;

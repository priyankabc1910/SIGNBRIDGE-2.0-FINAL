
// server/routes/history.js
const express = require('express');
const router = express.Router();
const { saveTranslation, getHistory } = require('../services/historyService');

router.post('/save', async (req, res) => {
  try {
    const { userId, input, output, type } = req.body || {};
    if (!userId || !type) {
      return res.status(400).json({ success: false, error: 'userId and type required' });
    }
    const result = await saveTranslation(userId, input, output, type);
    res.json({ success: true, data: result });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

router.get('/:userId', async (req, res) => {
  try {
    const history = await getHistory(req.params.userId);
    res.json({ success: true, data: history });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;

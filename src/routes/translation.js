// 🚀 SignBridge 2.0 - Translation Routes
const express = require('express');
const router = express.Router();
const { translateSignToText, translateTextToSign } = require('../services/translationService');

// ------------------- Sign → Text -------------------
router.post('/sign-to-text', async (req, res) => {
  try {
    const { landmarks, gesture, handedness } = req.body || {};

    if ((!landmarks || !landmarks.length) && !gesture) {
      return res.status(400).json({
        success: false,
        project: "SignBridge 2.0",
        error: "Missing input: landmarks or gesture required"
      });
    }

    const result = await translateSignToText(landmarks, gesture, handedness);

    return res.json({
      success: true,
      project: "SignBridge 2.0",
      type: "sign-to-text",
      data: result
    });
  } catch (error) {
    console.error("Sign→Text error: - translation.js:28", error);
    return res.status(500).json({
      success: false,
      project: "SignBridge 2.0",
      error: error.message
    });
  }
});

// ------------------- Text → Sign -------------------
router.post('/text-to-sign', async (req, res) => {
  try {
    let { text, options } = req.body || {};
    text = (text || "").trim();

    if (!text) {
      return res.status(400).json({
        success: false,
        project: "SignBridge 2.0",
        error: "Text is required"
      });
    }

    const result = await translateTextToSign(text, options);

    return res.json({
      success: true,
      project: "SignBridge 2.0",
      type: "text-to-sign",
      data: result
    });
  } catch (error) {
    console.error("Text→Sign error: - translation.js:60", error);
    return res.status(500).json({
      success: false,
      project: "SignBridge 2.0",
      error: error.message
    });
  }
});

module.exports = router;

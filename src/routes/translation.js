


// server/routes/translation.js
const express = require("express");
const router = express.Router();
const {
  translateSignToText,
  translateTextToSign,
  translateGestureSequenceToText
} = require("../services/translationService");

// Sign → Text
router.post("/sign-to-text", async (req,res)=>{
  try {
    const { landmarks, gesture } = req.body || {};
    if ((!landmarks || !landmarks.length) && !gesture)
      return res.status(400).json({ success:false,error:"Missing landmarks or gesture" });
    const data = await translateSignToText(landmarks, gesture);
    res.json({ success:true, data });
  } catch(e){ res.status(500).json({ success:false, error:e.message }); }
});

// Text → Sign
router.post("/text-to-sign", async (req,res)=>{
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ success:false, error:"Missing text" });
    const data = await translateTextToSign(text);
    res.json({ success:true, data });
  } catch(e){ res.status(500).json({ success:false, error:e.message }); }
});

// NEW: Sign sequence → Text
router.post("/sign-sequence-to-text", async (req,res)=>{
  try {
    const { gestures=[] } = req.body || {};
    const data = await translateGestureSequenceToText(gestures);
    res.json({ success:true, data });
  } catch(e){ res.status(500).json({ success:false, error:e.message }); }
});

module.exports = router;

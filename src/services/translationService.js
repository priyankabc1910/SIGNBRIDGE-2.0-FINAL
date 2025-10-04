// server/services/translationService.js
// ------------------------------------------------------------
// SignBridge 2.0 — Rule-based service
// - Text → Sign: always letters (A–Z) + pauses
// - Sign → Text: rule-based gesture analyzer (no ML)
// NOTE: Emojis are placeholders, NOT real ISL handshapes.
// ------------------------------------------------------------

// ===================== 1) Sign → Text labels =====================
const GESTURE_MAP = {
  thumbs_up:       "Super Good / Yes",
  thumbs_down:     "Bad / No",
  open_palm:       "Hello",
  wave:            "Bye",
  pointing_up:     "One",
  peace:           "Two / Peace",
  ily:             "❤️ Love / I Love You",
  fist:            "Stop",
  open_palm_hold:  "Wait",
  point_forward:   "You",
  point_self:      "Me",
  ok:              "Okay",
  unknown:         "Unknown gesture",
};

// ===================== 2) Alphabet fallback (A–Z) ================
// These are JUST emoji placeholders to visualize letters.
const ISL_ALPHABET = {
  "A": "👊", // fist
  "B": "✋", // open palm
  "C": "🤏", // pinch/curve
  "D": "☝️", // one finger up
  "E": "🤚", // palm up
  "F": "👌", // OK
  "G": "👉", // pointing
  "H": "✌️", // two fingers
  "I": "🤙", // shaka
  "J": "🌙", // curve placeholder
  "K": "🫰", // crossed
  "L": "👈", // left point
  "M": "✊", // closed fist
  "N": "🤞", // crossed fingers
  "O": "⚪", // circle
  "P": "🫱", // hand out
  "Q": "🫲", // hand out other side
  "R": "🤝", // handshake
  "S": "✂️", // scissor placeholder
  "T": "🙏", // prayer
  "U": "✌️", // two close
  "V": "✌️", // victory
  "W": "🖖", // vulcan
  "X": "❌", // cross
  "Y": "🤟", // ILY style
  "Z": "⚡"  // lightning
};

// ====================== 3) Public API =============================

// Sign → Text
async function translateSignToText(landmarks, gestureHint, handedness = "Right") {
  if ((!landmarks || !landmarks.length) && !gestureHint) {
    return { text: "", confidence: 0, gesture: "unknown" };
  }
  const recognized = gestureHint || analyzeHandLandmarks(landmarks, handedness);
  return {
    text: GESTURE_MAP[recognized] || "Unknown gesture",
    confidence: 0.8,
    gesture: recognized
  };
}

// Text → Sign (always letters + pauses)
async function translateTextToSign(text) {
  const raw = String(text ?? "");
  const signs = [];

  for (const ch of raw) {
    if (/[A-Za-z]/.test(ch)) {
      const up = ch.toUpperCase();
      const emoji = ISL_ALPHABET[up] || "▪️"; // fallback
      signs.push({
        character: up,
        emoji,
        description: `Letter ${up}`
      });
    } else if (ch === " ") {
      signs.push({
        character: " ",
        emoji: "⏸️",
        description: "Pause"
      });
    }
    // Optional: add numbers or punctuation mapping here
  }

  return {
    text: raw,
    signs,
    animation: generateAnimationSequence(signs),
  };
}

function generateAnimationSequence(signs) {
  return signs.map((s, i) => ({
    step: i,
    duration: s.emoji === "⏸️" ? 300 : 500,
    sign: s.emoji,
    description: s.description
  }));
}

// ================== 4) Simple Gesture Analyzer ===================
function analyzeHandLandmarks(lm, handedness = "Right") {
  try {
    if (!Array.isArray(lm) || lm.length < 21) return "unknown";

    const norm = normalizeToWrist(lm);
    const { thumbExt, indexExt, middleExt, ringExt, pinkyExt } = getFingerStates(norm, handedness);

    const wrist = norm[0];
    const thumbTip = norm[4];
    const indexTip = norm[8];
    const middleTip = norm[12];

    const allExtended = thumbExt && indexExt && middleExt && ringExt && pinkyExt;

    if (distance2D(indexTip, thumbTip) < 0.07 && (middleExt || ringExt || pinkyExt)) return "ok";

    const othersCurled = !indexExt && !middleExt && !ringExt && !pinkyExt;
    if (thumbExt && othersCurled) {
      if (thumbTip.y < wrist.y - 0.08) return "thumbs_up";
      if (thumbTip.y > wrist.y + 0.08) return "thumbs_down";
    }

    if (allExtended) return "open_palm";
    if (areFingersTightlyCurled(norm) && !thumbExt) return "fist";
    if (indexExt && middleExt && !ringExt && !pinkyExt) return "peace";
    if (indexExt && !middleExt && !ringExt && !pinkyExt && indexTip.y < wrist.y - 0.05) return "pointing_up";
    if (indexExt && !middleExt && !ringExt && pinkyExt && thumbExt) return "ily";
    if (indexExt && !middleExt && !ringExt && !pinkyExt) return "point_forward";

    return "unknown";
  } catch {
    return "unknown";
  }
}

// ================== 5) Geometry helpers ==========================
function normalizeToWrist(lm) {
  const wrist = lm[0];
  const scaleRef = distance2D(wrist, lm[9]) || 1;
  return lm.map(p => ({
    x: (p.x - wrist.x) / scaleRef,
    y: (p.y - wrist.y) / scaleRef,
    z: (p.z ?? 0) / scaleRef
  }));
}

function getFingerStates(lm, handedness = "Right") {
  const tips = { thumb: 4, index: 8, middle: 12, ring: 16, pinky: 20 };
  const pips = { thumb: 3, index: 6, middle: 10, ring: 14, pinky: 18 };

  const indexExt  = lm[tips.index].y  < lm[pips.index].y  - 0.025;
  const middleExt = lm[tips.middle].y < lm[pips.middle].y - 0.025;
  const ringExt   = lm[tips.ring].y   < lm[pips.ring].y   - 0.025;
  const pinkyExt  = lm[tips.pinky].y  < lm[pips.pinky].y  - 0.025;

  const tipX = lm[tips.thumb].x;
  const pipX = lm[pips.thumb].x;
  const delta = 0.03;
  const thumbExt = handedness === "Left" ? tipX < (pipX - delta) : tipX > (pipX + delta);

  return { thumbExt, indexExt, middleExt, ringExt, pinkyExt };
}

function areFingersTightlyCurled(lm) {
  const tips = [4, 8, 12, 16, 20];
  const pips = [3, 6, 10, 14, 18];
  let curled = 0;
  for (let i = 0; i < tips.length; i++) {
    if (lm[tips[i]].y > lm[pips[i]].y - 0.005) curled++;
  }
  return curled >= 4;
}

function distance2D(a, b) {
  const dx = (a?.x ?? 0) - (b?.x ?? 0);
  const dy = (a?.y ?? 0) - (b?.y ?? 0);
  return Math.hypot(dx, dy);
}

// ================== 6) Exports ====================================
module.exports = {
  translateSignToText,
  translateTextToSign
};








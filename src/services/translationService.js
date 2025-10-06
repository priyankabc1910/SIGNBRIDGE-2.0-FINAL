
// server/services/translationService.js
// ------------------------------------------------------------
// SignBridge 2.0 — Advanced Rule-based Gesture Translator
// Supports: Single gestures + Multi-gesture sequences
// NOTE: Emojis are placeholders, not actual ISL shapes
// ------------------------------------------------------------

// ===================== 1) Base single-gesture map =====================
const GESTURE_MAP = {
  thumbs_up:       "Good / Yes",
  thumbs_down:     "Bad / No",
  open_palm:       "Hello",
  fist:            "Stop",
  peace:           "Peace",
  ok:              "Okay",
  pointing_up:     "One",
  two:             "Two",
  three:           "Three",
  four:            "Four",
  point_forward:   "You",
  point_self:      "Me",
  call:            "Call",
  rock:            "ILY / Love",
  open_palm_hold:  "Wait",
  unknown:         "Unknown gesture",
};

// ===================== 2) Text → Sign (Word-to-Emoji) ================
const WORD_SIGN_MAP = {
  "HELLO": "👋",
  "HI": "👋",
  "BYE": "👋",
  "GOOD": "👍",
  "YES": "👍",
  "BAD": "👎",
  "NO": "👎",
  "STOP": "✊",
  "WAIT": "🤚",
  "OK": "👌",
  "OKAY": "👌",
  "LOVE": "❤️",
  "I LOVE YOU": "🤟",
  "PLEASE": "🙏",
  "THANK YOU": "🙏",
  "YOU": "👉",
  "ME": "👈",
  "I": "👈",
  "ONE": "☝️",
  "TWO": "✌️",
  "PEACE": "✌️",
  "GOOD MORNING": "🌅",
  "GOOD NIGHT": "🌙",
  "SEE YOU": "👋👉",
  "HOW ARE YOU": "🖐👉❓",
  "WHAT IS YOUR NAME": "🤔👉💬",
  "NICE TO MEET YOU": "😊🤝👉"
};

// ===================== 3) Alphabet fallback (A–Z) =====================
const ISL_ALPHABET = {
  "A": "👊", "B": "✋", "C": "🤏", "D": "☝️", "E": "🤚",
  "F": "👌", "G": "👉", "H": "✌️", "I": "🤙", "J": "🌙",
  "K": "🫰", "L": "👈", "M": "✊", "N": "🤞", "O": "⚪",
  "P": "🫱", "Q": "🫲", "R": "🤝", "S": "✂️", "T": "🙏",
  "U": "✌️", "V": "✌️", "W": "🖖", "X": "❌", "Y": "🤟", "Z": "⚡"
};

// ===================== 4) Multi-Gesture Sentence Patterns =============
// Patterns are short symbolic sequences → mapped to natural sentences
// Each pattern = sequence of gesture IDs (in detection order)
const SEQUENCE_PATTERNS = [
  { pattern: ["open_palm"], text: "Hello" },
  { pattern: ["open_palm", "point_forward"], text: "Hello" },
  { pattern: ["open_palm", "point_forward", "ok"], text: "How are you?" },
  { pattern: ["open_palm", "point_forward", "peace"], text: "How are you?" },
  { pattern: ["point_self", "thumbs_up"], text: "I am good" },
  { pattern: ["point_self", "ok"], text: "I am fine" },
  { pattern: ["point_self", "thumbs_down"], text: "I am not fine" },
  { pattern: ["open_palm", "point_self", "open_palm"], text: "Thank you" },
  { pattern: ["thumbs_up"], text: "Yes" },
  { pattern: ["thumbs_down"], text: "No" },
  { pattern: ["fist"], text: "Stop" },
  { pattern: ["point_forward", "thumbs_up"], text: "You are good" },
  { pattern: ["point_self", "point_forward"], text: "Me and you" },
  { pattern: ["open_palm", "open_palm"], text: "Goodbye" },
  { pattern: ["open_palm", "thumbs_up"], text: "Good morning" },
  { pattern: ["open_palm", "fist"], text: "Good night" },
  { pattern: ["peace", "point_forward"], text: "Peace to you" },
  { pattern: ["point_forward", "point_self", "ok"], text: "What is your name?" },
  { pattern: ["point_forward", "point_self", "peace"], text: "Nice to meet you" },
  { pattern: ["point_forward", "call"], text: "Call me" },
  { pattern: ["open_palm", "peace", "point_forward"], text: "See you soon" },
  { pattern: ["open_palm", "ok", "point_forward"], text: "How are you today?" },
  { pattern: ["point_self", "rock"], text: "I love you" },
  { pattern: ["rock", "point_forward"], text: "Love you" },
];

// ====================== 5) Text → Sign Translation ====================
async function translateTextToSign(text) {
  const upper = (text || "").toUpperCase().trim();
  if (!upper) return packTextToSign(text, []);

  // 1) Phrase match
  if (WORD_SIGN_MAP[upper]) {
    const emoji = WORD_SIGN_MAP[upper];
    return packTextToSign(text, [{ character: upper, emoji, description: upper }]);
  }

  // 2) Word-by-word
  const tokens = upper.split(/\s+/);
  const signs = [];
  for (const tok of tokens) {
    if (WORD_SIGN_MAP[tok]) {
      signs.push({ character: tok, emoji: WORD_SIGN_MAP[tok], description: `Sign for ${tok}` });
    } else {
      for (const ch of tok) {
        const up = ch.toUpperCase();
        if (ISL_ALPHABET[up]) {
          signs.push({ character: up, emoji: ISL_ALPHABET[up], description: `Letter ${up}` });
        }
      }
      // Add a pause between words
      signs.push({ character: " ", emoji: "⏸️", description: "Pause" });
    }
  }
  if (signs.length && signs[signs.length - 1].emoji === "⏸️") signs.pop();

  return packTextToSign(text, signs);
}

// ====================== 6) Sign → Text ================================
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

// ====================== 7) Sign SEQUENCE → Text ======================
async function translateGestureSequenceToText(gestureSequence = []) {
  const cleaned = compressSequence(
    gestureSequence.filter(g => g && g !== "unknown")
  );

  const asText = matchSequenceToText(cleaned);
  const result = asText || cleaned.map(g => GESTURE_MAP[g] || g).join(" ");

  return {
    inputGestures: gestureSequence,
    cleanedGestures: cleaned,
    text: asText || result
  };
}

function compressSequence(seq) {
  const out = [];
  for (const g of seq) {
    const prev = out[out.length - 1];
    if (g !== prev) out.push(g);
  }
  return out;
}

function matchSequenceToText(seq) {
  const key = seq.join(">");
  for (const p of SEQUENCE_PATTERNS.sort((a,b)=>b.pattern.length - a.pattern.length)) {
    if (key === p.pattern.join(">")) return p.text;
  }
  for (const p of SEQUENCE_PATTERNS.sort((a,b)=>b.pattern.length - a.pattern.length)) {
    const needle = p.pattern.join(">");
    if (key.includes(needle)) return p.text;
  }
  return null;
}

// ====================== 8) Helpers ===================================
function packTextToSign(text, signs) {
  return { text, signs, animation: generateAnimationSequence(signs) };
}

function generateAnimationSequence(signs) {
  return signs.map((s, i) => ({
    step: i, duration: 500, sign: s.emoji, description: s.description
  }));
}

// Simple geometry for demo
function analyzeHandLandmarks(lm, handedness = "Right") {
  if (!Array.isArray(lm) || lm.length < 21) return "unknown";
  const norm = normalizeToWrist(lm);
  const { thumbExt, indexExt, middleExt, ringExt, pinkyExt } = getFingerStates(norm, handedness);
  const wrist = norm[0];
  const thumbTip = norm[4];
  const indexTip = norm[8];
  const middleTip = norm[12];
  const allExtended = thumbExt && indexExt && middleExt && ringExt && pinkyExt;

  // Simple rules
  if (distance2D(indexTip, thumbTip) < 0.07) return "ok";
  if (thumbExt && !indexExt && !middleExt && !ringExt && !pinkyExt && thumbTip.y < wrist.y - 0.08) return "thumbs_up";
  if (thumbExt && !indexExt && !middleExt && !ringExt && !pinkyExt && thumbTip.y > wrist.y + 0.08) return "thumbs_down";
  if (allExtended) return "open_palm";
  if (!thumbExt && !indexExt && !middleExt && !ringExt && !pinkyExt) return "fist";
  if (indexExt && middleExt && !ringExt && !pinkyExt) return "peace";
  if (indexExt && !middleExt && !ringExt && !pinkyExt) return "point_forward";
  if (indexExt && !middleExt && !ringExt && pinkyExt && thumbExt) return "rock";
  return "unknown";
}

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
  const thumbExt = handedness === "Left" ? tipX < (pipX - 0.03) : tipX > (pipX + 0.03);

  return { thumbExt, indexExt, middleExt, ringExt, pinkyExt };
}

function distance2D(a, b) {
  const dx = (a?.x ?? 0) - (b?.x ?? 0);
  const dy = (a?.y ?? 0) - (b?.y ?? 0);
  return Math.hypot(dx, dy);
}

// ====================== 9) Exports ===================================
module.exports = {
  translateSignToText,
  translateTextToSign,
  translateGestureSequenceToText
};






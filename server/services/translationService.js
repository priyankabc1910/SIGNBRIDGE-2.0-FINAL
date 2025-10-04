// server/services/translationService.js
// SignBridge 2.0 — Starter Gestures (ISL-inspired placeholders)

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
  "I LOVE YOU": "❤️",
  "PLEASE": "🙏",
  "THANK YOU": "🙏",
  "YOU": "👉",
  "ME": "👈",
  "I": "👈",
  "ONE": "☝️",
  "TWO": "✌️",
  "PEACE": "✌️"
};

const ISL_ALPHABET = {
  "A": "👊", "B": "✋", "C": "🤏", "D": "👆", "E": "🤚",
  "F": "✊", "G": "👌", "H": "✌️", "I": "🤙", "J": "🤞",
  "K": "🫰", "L": "👍", "M": "✊", "N": "🤜", "O": "👊",
  "P": "🫱", "Q": "🫲", "R": "🤝", "S": "👏", "T": "🙏",
  "U": "🫶", "V": "✌️", "W": "🤘", "X": "🤞", "Y": "🤙", "Z": "👈"
};

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

async function translateTextToSign(text) {
  const upper = (text || "").toUpperCase().trim();
  if (!upper) return packTextToSign(text, []);

  if (WORD_SIGN_MAP[upper]) {
    const emoji = WORD_SIGN_MAP[upper];
    return packTextToSign(text, [{ character: upper, emoji, description: upper }]);
  }

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
      signs.push({ character: " ", emoji: "⏸️", description: "Pause" });
    }
  }
  if (signs.length && signs[signs.length - 1].emoji === "⏸️") signs.pop();
  return packTextToSign(text, signs);
}

function packTextToSign(text, signs) {
  return { text, signs, animation: generateAnimationSequence(signs) };
}

function generateAnimationSequence(signs) {
  return signs.map((s, i) => ({
    step: i, duration: 500, sign: s.emoji, description: s.description
  }));
}

function analyzeHandLandmarks(lm, handedness = "Right") {
  try {
    if (!Array.isArray(lm) || lm.length < 21) return "unknown";
    const norm = normalizeToWrist(lm);
    const { thumbExt, indexExt, middleExt, ringExt, pinkyExt } = getFingerStates(norm, handedness);
    const wrist = norm[0], thumbTip = norm[4], indexTip = norm[8], middleTip = norm[12], ringTip = norm[16], pinkyTip = norm[20];
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

  const tipX = lm[tips.thumb].x, pipX = lm[pips.thumb].x, delta = 0.03;
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

module.exports = { translateSignToText, translateTextToSign };














// services/historyService.js
// 🚀 SignBridge 2.0 - History Service
// Persists and fetches translation history.
// Uses in-memory Map by default, auto-switches to Firestore if Firebase Admin is configured.

let db = null;

// ---------- Optional Firebase Admin (Production) ----------
try {
  // Only attempt if package is installed (it is in your deps) and env is ready
  const admin = require('firebase-admin');

  if (!admin.apps.length) {
    // Two common ways to auth:
    // 1) GOOGLE_APPLICATION_CREDENTIALS env pointing to a JSON key file
    // 2) FIREBASE_SERVICE_ACCOUNT env containing the JSON string
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      admin.initializeApp({
        credential: admin.credential.cert(
          JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        ),
      });
    } else {
      // Falls back to ADC if available (e.g., on Firebase Hosting/Cloud Run)
      admin.initializeApp();
    }
  }

  db = admin.firestore();
  // console.log("✅ Firestore enabled for SignBridge 2.0 history.");
} catch (_) {
  // Silently fall back to in-memory if firebase-admin isn’t configured at runtime
  db = null;
  // console.log("ℹ️ Using in-memory history store for SignBridge 2.0.");
}

// ---------- Fallback In-Memory Store ----------
const memoryStore = new Map(); // key: userId, value: array of entries

// ---------- Helpers ----------
function nowISO() {
  return new Date().toISOString();
}

function validateSavePayload({ userId, input, output, type }) {
  if (!userId || !input || !output || !type) {
    throw new Error("Missing fields: userId, input, output, and type are required");
  }
}

// ---------- API ----------
async function saveTranslation(userId, input, output, type) {
  try {
    validateSavePayload({ userId, input, output, type });

    const entry = {
      id: Date.now().toString(),
      userId,
      input,
      output,
      type,              // e.g., "text-to-sign" | "sign-to-text" | "speech-to-text"
      timestamp: nowISO()
    };

    // Prefer Firestore if available
    if (db) {
      const ref = await db.collection('translations').add(entry);
      return {
        project: "SignBridge 2.0",
        saved: "firestore",
        id: ref.id,
        data: { ...entry, id: ref.id }
      };
    }

    // Fallback to memory
    if (!memoryStore.has(userId)) memoryStore.set(userId, []);
    memoryStore.get(userId).push(entry);

    return {
      project: "SignBridge 2.0",
      saved: "memory",
      id: entry.id,
      data: entry
    };
  } catch (error) {
    return {
      project: "SignBridge 2.0",
      error: error.message
    };
  }
}

async function getHistory(userId, limit = 20) {
  try {
    if (!userId) throw new Error("Missing parameter: userId required");

    // Prefer Firestore if available
    if (db) {
      const snapshot = await db
        .collection('translations')
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(limit)
        .get();

      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return {
        project: "SignBridge 2.0",
        source: "firestore",
        userId,
        count: items.length,
        data: items
      };
    }

    // Fallback to memory
    const userHistory = memoryStore.get(userId) || [];
    const sliced = userHistory.slice(-limit).reverse(); // newest first
    return {
      project: "SignBridge 2.0",
      source: "memory",
      userId,
      count: sliced.length,
      data: sliced
    };
  } catch (error) {
    return {
      project: "SignBridge 2.0",
      error: error.message
    };
  }
}

// ---------- Exports ----------
module.exports = {
  saveTranslation,
  getHistory
};

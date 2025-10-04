// src/services/api.js
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// -------- Text -> Sign -------------
export async function translateTextToSign(text) {
  const res = await fetch(`${API_URL}/translation/text-to-sign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  return res.json();
}

// -------- Sign -> Text -------------
export async function translateSignToText(landmarks, gesture) {
  const res = await fetch(`${API_URL}/translation/sign-to-text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ landmarks, gesture }),
  });
  return res.json();
}

// -------- History Save -------------
export async function saveTranslation(userId, input, output, type) {
  const res = await fetch(`${API_URL}/history/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, input, output, type }),
  });
  return res.json();
}

// -------- Get History --------------
export async function getHistory(userId) {
  const res = await fetch(`${API_URL}/history/${userId}`);
  return res.json();
}




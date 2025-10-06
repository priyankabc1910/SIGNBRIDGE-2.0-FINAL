



// src/services/api.js
const base =
  process.env.REACT_APP_API_URL?.replace(/\/+$/, '') || // env without trailing slash
  (window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : '/api'); // fallback for same-origin setups in production behind a proxy
const API_URL = "https://signbridge-2-0-final-46qxb6icy-priyankabc1910s-projects.vercel.app/api";

async function request(path, options = {}) {
  const url = `${base}${path.startsWith('/') ? path : '/' + path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export async function translateTextToSign(text) {
  return request('/translation/text-to-sign', {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

export async function translateSignToText(landmarks, gesture, handedness) {
  return request('/translation/sign-to-text', {
    method: 'POST',
    body: JSON.stringify({ landmarks, gesture, handedness }),
  });
}

export async function getHistory(userId) {
  return request(`/history/${encodeURIComponent(userId)}`);
}

export async function saveTranslation(userId, input, output, type) {
  return request('/history/save', {
    method: 'POST',
    body: JSON.stringify({ userId, input, output, type }),
  });
}

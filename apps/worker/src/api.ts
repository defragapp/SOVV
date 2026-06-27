/**
 * Sovereign OS Frontend API Client
 * 
 * These requests are proxied through Next.js (apps/web/app/api/*) 
 * to the Worker backend at api.defrag.app to preserve session cookies.
 */

const API_BASE = 'https://api.defrag.app';

export async function explain(text: string, mode: string = 'sovereign') {
  const res = await fetch(`${API_BASE}/api/explain`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ text, mode }),
  });
  return res.json();
}

export async function getPatterns() {
  const res = await fetch(`${API_BASE}/api/patterns`, {});
  return res.json();
}

export async function verifyPattern(patternId: string, action: 'confirm' | 'dismiss') {
  const res = await fetch(`${API_BASE}/api/patterns/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ patternId, action }),
  });
  return res.json();
}
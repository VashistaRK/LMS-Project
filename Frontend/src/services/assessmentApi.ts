/* eslint-disable @typescript-eslint/no-explicit-any */
const Base_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const BASE = `${Base_URL}/api/assessments`;

async function parse(res: Response) {
  const txt = await res.text();
  const data = txt ? JSON.parse(txt) : {};
  if (!res.ok) throw new Error(data?.error || res.statusText);
  return data;
}

export async function createTrack(payload: any) {
  const res = await fetch(`${BASE}/admin/tracks`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parse(res);
}

export async function createTest(payload: any) {
  const res = await fetch(`${BASE}/admin/tests`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return parse(res);
}

export async function listTracks() {
  const res = await fetch(`${BASE}/tracks`, { credentials: 'include' });
  return parse(res);
}

export async function listTestsForTrack(slug: string) {
  const res = await fetch(`${BASE}/tracks/${encodeURIComponent(slug)}/tests`, { credentials: 'include' });
  return parse(res);
}

export async function getTest(slug: string, testId: string) {
  const res = await fetch(`${BASE}/tracks/${encodeURIComponent(slug)}/tests/${encodeURIComponent(testId)}`, { credentials: 'include' });
  return parse(res);
}

export async function startAttempt(slug: string, testId: string) {
  const res = await fetch(`${BASE}/tracks/${encodeURIComponent(slug)}/tests/${encodeURIComponent(testId)}/start`, {
    method: 'POST',
    credentials: 'include'
  });
  return parse(res);
}

export async function submitAttempt(attemptId: string, answers: any[]) {
  const res = await fetch(`${BASE}/attempts/${encodeURIComponent(attemptId)}/submit`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  });
  return parse(res);
}
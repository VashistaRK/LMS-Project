/* eslint-disable @typescript-eslint/no-explicit-any */
const Base_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

// Helper to build API URLs safely when VITE_API_URL may already include '/api'
function buildApi(path: string) { 
  const root = (Base_URL || '').replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  if (root.endsWith('/api')) return `${root}${p}`; // avoid /api/api
  return `${root}/api${p}`;
}

const BASE = buildApi('/questions');

async function handleRes(res: Response) {
  const txt = await res.text();
  const data = txt ? JSON.parse(txt) : {};
  if (!res.ok) throw new Error(data?.error || res.statusText);
  return data;
}

export async function uploadQuizDoc(
  courseId: string,
  sectionId: string,
  chapterId: string,
  form: FormData
) {
  const url = buildApi(`/questions/${courseId}/${sectionId}/${chapterId}/upload-doc`);
  const res = await fetch(url, {
    method: "POST",
    body: form,
  });

  return handleRes(res);
}


export async function getQuestions(genre?: string) {
  const url = genre ? `${BASE}?genre=${encodeURIComponent(genre)}` : `${BASE}`;
  const res = await fetch(url, { credentials: 'include' });
  return handleRes(res);
}

export async function getQuestion(id: string) {
  const res = await fetch(`${BASE}/${id}`, { credentials: 'include' });
  return handleRes(res);
}

export async function createQuestion(payload: any) {
  const res = await fetch(`${BASE}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleRes(res);
}

export async function updateQuestion(id: string, payload: any) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleRes(res);
}

export async function deleteQuestion(id: string) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return handleRes(res);
}

export async function getGenres() {
  const res = await fetch(`${BASE}/genres`, { credentials: 'include' });
  return handleRes(res);
}
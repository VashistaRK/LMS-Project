const Base_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const BASE = `${Base_URL}/api/companies`;

async function parse(res: Response) {
  const txt = await res.text();
  const data = txt ? JSON.parse(txt) : {};
  if (!res.ok) throw new Error(data?.error || res.statusText);
  return data;
}

export async function listCompanyTests(slug: string) {
  const res = await fetch(`${BASE}/${encodeURIComponent(slug)}/tests`, { credentials: 'include' });
  return parse(res);
}

export async function startCompanyTest(slug: string, testId: string) {
  const res = await fetch(`${BASE}/${encodeURIComponent(slug)}/tests/${encodeURIComponent(testId)}/start`, {
    method: 'POST',
    credentials: 'include'
  });
  return parse(res);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function submitCompanyTest(slug: string, testId: string, responses: any) {
  const res = await fetch(`${BASE}/${encodeURIComponent(slug)}/tests/${encodeURIComponent(testId)}/submit`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ responses }),
  });
  return parse(res);
}
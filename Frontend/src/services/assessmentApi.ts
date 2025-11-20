/* eslint-disable @typescript-eslint/no-explicit-any */

const BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:3000";
const BASE = `${BASE_URL}/api/assessments`;

async function parse(res: Response) {
  const text = await res.text();
  let data: any = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    // response wasn't JSON; keep empty
  }

  if (!res.ok) {
    throw new Error(data?.error || res.statusText);
  }
  return data;
}

/** Utility request wrapper */
async function request(
  url: string,
  options: RequestInit = {}
): Promise<any> {
  const res = await fetch(url, {
    credentials: "include",
    ...options,
  });
  return parse(res);
}

/* ======================================================
   ADMIN: TRACKS & TESTS
====================================================== */

export function createTrack(payload: {
  title: string;
  slug: string;
  description?: string;
  type?: string;
}) {
  return request(`${BASE}/admin/tracks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function updateTrack(slug: string, payload: any) {
  return request(`${BASE}/admin/tracks/${encodeURIComponent(slug)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function deleteTrack(slug: string) {
  return request(`${BASE}/admin/tracks/${encodeURIComponent(slug)}`, {
    method: "DELETE",
  });
}

export function createTest(payload: {
  trackSlug: string;
  testId: string;
  title: string;
  type?: string;
  durationSec?: number;
  questionIds?: string[];
  meta?: any;
}) {
  return request(`${BASE}/admin/tests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function updateTest(
  trackSlug: string,
  testId: string,
  payload: any
) {
  return request(
    `${BASE}/admin/tests/${encodeURIComponent(trackSlug)}/${encodeURIComponent(testId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
}

export function deleteTest(trackSlug: string, testId: string) {
  return request(
    `${BASE}/admin/tests/${encodeURIComponent(trackSlug)}/${encodeURIComponent(testId)}`,
    {
      method: "DELETE",
    }
  );
}

export function listTestAttempts(slug: string, testId: string) {
  return request(
    `${BASE}/admin/tests/${encodeURIComponent(slug)}/${encodeURIComponent(
      testId
    )}/attempts`
  );
}

/* ======================================================
   PUBLIC: TRACKS & TESTS
====================================================== */

export function listTracks() {
  return request(`${BASE}/tracks`);
}

export function listTestsForTrack(slug: string) {
  return request(`${BASE}/tracks/${encodeURIComponent(slug)}/tests`);
}

export function getTest(slug: string, testId: string) {
  return request(
    `${BASE}/tracks/${encodeURIComponent(slug)}/tests/${encodeURIComponent(
      testId
    )}`
  );
}

/* ======================================================
   ATTEMPTS
====================================================== */

export function startAttempt(slug: string, testId: string) {
  return request(
    `${BASE}/tracks/${encodeURIComponent(slug)}/tests/${encodeURIComponent(
      testId
    )}/start`,
    {
      method: "POST",
    }
  );
}

export function submitAttempt(attemptId: string, answers: any[]) {
  return request(
    `${BASE}/attempts/${encodeURIComponent(attemptId)}/submit`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    }
  );
}

export function terminateAttempt(attemptId: string) {
  return request(
    `${BASE}/attempts/${encodeURIComponent(attemptId)}/terminate`,
    {
      method: "POST",
    }
  );
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export class ApiError extends Error {
  details?: { field: string; message: string }[];
  constructor(message: string, details?: { field: string; message: string }[]) { super(message); this.details = details; }
}

export const getToken = () => (typeof window === "undefined" ? null : localStorage.getItem("hirehub_token"));

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Render's free plan sleeps; the first request can take ~60s. Retry while it wakes up.
async function fetchWithRetry(url: string, init: RequestInit, tries = 6): Promise<Response> {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, init);
      if ([502, 503, 504].includes(res.status) && i < tries - 1) { await sleep(8000); continue; }
      return res;
    } catch {
      if (i === tries - 1) throw new ApiError("The server is waking up. Please wait a minute and try again.");
      await sleep(8000);
    }
  }
  throw new ApiError("The server is not responding. Please try again.");
}

export async function api<T = any>(path: string, opts: { method?: string; body?: unknown; form?: FormData } = {}): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!opts.form) headers["Content-Type"] = "application/json";
  const res = await fetchWithRetry(`${API_URL}/api${path}`, {
    method: opts.method || "GET",
    headers,
    body: opts.form ? opts.form : opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || "Request failed", data.details);
  return data as T;
}
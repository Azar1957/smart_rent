// Лёгкий клиент для REST API IRIS.
// На клиенте все запросы идут через /api/iris/* (rewrite в next.config.js → IRIS).

export const API_BASE =
  typeof window === 'undefined'
    ? process.env.IRIS_API_BASE || 'http://localhost:52773/api/smartrent/v1'
    : '/api/iris';

export type ApiOptions = RequestInit & { token?: string | null };

export async function api<T = any>(path: string, opts: ApiOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string> | undefined),
  };
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers, cache: 'no-store' });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const j = await res.json();
      if (j?.error) msg = j.error;
    } catch {
      /* noop */
    }
    throw new Error(msg);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

export const TOKEN_KEY = 'smartrent_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

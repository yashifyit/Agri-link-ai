/**
 * Centralized API client for KisanLink frontend.
 *
 * - Reads base URL from VITE_API_URL environment variable
 * - Automatically attaches Authorization: Bearer <token>
 * - Handles 401 → dispatches a custom event to trigger logout
 * - Normalises trailing slashes
 */

const rawBase = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';
// Strip trailing slash so we can always safely append /path
export const API_BASE = rawBase.replace(/\/+$/, '');

function getToken(): string | null {
  return localStorage.getItem('kisanlink_token');
}

interface FetchOptions extends RequestInit {
  /** If true, skips attaching Authorization header (e.g. login/register) */
  skipAuth?: boolean;
}

/**
 * Core fetch wrapper. Throws on non-2xx responses with a readable message.
 */
export async function apiFetch<T = any>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { skipAuth, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string> ?? {}),
  };

  if (!skipAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // Normalise path — always start with /
  const normPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${API_BASE}${normPath}`;

  const response = await fetch(url, { ...fetchOptions, headers });

  if (response.status === 401) {
    // Dispatch global event so AuthContext can react and clear auth state
    window.dispatchEvent(new CustomEvent('kisanlink:auth:unauthorized'));
    const err = await response.json().catch(() => ({ detail: 'Unauthorized' }));
    throw new Error(err.detail ?? 'Unauthorized');
  }

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: `HTTP ${response.status}` }));
    throw new Error(err.detail ?? `Request failed (${response.status})`);
  }

  // Handle empty responses (204 No Content etc.)
  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

/** Convenience wrappers */
export const apiGet = <T = any>(path: string, opts?: FetchOptions) =>
  apiFetch<T>(path, { method: 'GET', ...opts });

export const apiPost = <T = any>(path: string, body?: unknown, opts?: FetchOptions) =>
  apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body), ...opts });

export const apiPatch = <T = any>(path: string, body?: unknown, opts?: FetchOptions) =>
  apiFetch<T>(path, { method: 'PATCH', body: JSON.stringify(body), ...opts });

export const apiDelete = <T = any>(path: string, opts?: FetchOptions) =>
  apiFetch<T>(path, { method: 'DELETE', ...opts });

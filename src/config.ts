/// <reference types="vite/client" />

// Frontend configuration helpers

export const API_BASE = import.meta.env.VITE_API_BASE || '';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export const buildApiUrl = (input: string) => {
  return input.startsWith('http') ? input : `${API_BASE}${input}`;
};

function readCookie(name: string): string | null {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = document.cookie.match(new RegExp(`(?:^|; )${escaped}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function apiFetch(input: string, init?: RequestInit) {
  const url = buildApiUrl(input);
  const csrfToken = readCookie('csrf_token');
  const headers = new Headers(init?.headers || {});
  if (csrfToken && !headers.has('x-csrf-token')) {
    headers.set('x-csrf-token', csrfToken);
  }

  return fetch(url, {
    credentials: 'include',
    headers,
    ...init,
  });
}

export async function apiFetchJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await apiFetch(input, init);
  if (!response.ok) {
    throw new ApiError(`API request failed: ${response.status}`, response.status);
  }
  return (await response.json()) as T;
}

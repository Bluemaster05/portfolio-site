import createClient from 'openapi-fetch';
import type { paths } from './schema';

/**
 * Browser client for the admin portal. Auth rides on httpOnly cookies set by the API, so the API
 * must share a site with this app (SameSite=strict). Non-GET requests carry a fresh CSRF token,
 * and a 401 triggers one refresh-and-retry.
 */
const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];
const AUTH_PATHS = ['/api/auth/login', '/api/auth/refresh', '/api/auth/csrf-token'];

async function getCsrfToken(): Promise<string> {
  try {
    const response = await fetch(`${baseUrl}/api/auth/csrf-token`, { credentials: 'include' });
    const data: { token?: unknown } = await response.json();
    return typeof data.token === 'string' ? data.token : '';
  } catch {
    return '';
  }
}

async function withCsrf(request: Request): Promise<Request> {
  if (SAFE_METHODS.includes(request.method.toUpperCase())) return request;
  const headers = new Headers(request.headers);
  const token = await getCsrfToken();
  if (token) headers.set('X-CSRF-Token', token);
  return new Request(request, { headers });
}

let refreshing: Promise<boolean> | null = null;

/** One refresh at a time, shared by every request that hit a 401 meanwhile. */
function refreshSession(): Promise<boolean> {
  refreshing ??= (async () => {
    try {
      const request = await withCsrf(
        new Request(`${baseUrl}/api/auth/refresh`, { method: 'POST', credentials: 'include' }),
      );
      return (await fetch(request)).ok;
    } catch {
      return false;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

async function adminFetch(input: Request): Promise<Response> {
  const isAuthPath = AUTH_PATHS.some((path) => input.url.includes(path));
  // Keep an unread copy so the request can be replayed after a refresh
  const retry = isAuthPath ? null : input.clone();

  const response = await fetch(await withCsrf(input));
  if (response.status === 401 && retry && (await refreshSession())) {
    return fetch(await withCsrf(retry));
  }
  return response;
}

export const adminClient = createClient<paths>({
  baseUrl,
  credentials: 'include',
  fetch: adminFetch,
});

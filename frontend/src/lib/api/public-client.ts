import 'server-only';
import createClient from 'openapi-fetch';
import type { paths } from './schema';

/**
 * Server-side client for the read-only public API. The token never reaches the browser:
 * `server-only` makes importing this from a client component a build error.
 */
export const publicApi = createClient<paths>({
  baseUrl: process.env.API_URL ?? 'http://localhost:4000',
  headers: { 'X-API-Key': process.env.PORTFOLIO_API_TOKEN ?? '' },
});

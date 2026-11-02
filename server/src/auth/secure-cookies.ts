import 'dotenv/config';

/**
 * Whether auth and CSRF cookies are marked Secure: in production by default. COOKIE_SECURE=false
 * allows signing in over plain HTTP, e.g. an admin reached only through a VPN, which already
 * encrypts the traffic. Browsers drop Secure cookies set over HTTP.
 */
export const secureCookies = process.env.COOKIE_SECURE
  ? process.env.COOKIE_SECURE === 'true'
  : process.env.NODE_ENV === 'production';

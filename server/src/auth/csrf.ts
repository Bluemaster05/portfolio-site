import { doubleCsrf } from 'csrf-csrf';

const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
  getSecret: () => {
    if (!process.env.CSRF_SECRET) throw new Error('CSRF_SECRET is not defined');
    return process.env.CSRF_SECRET;
  },
  // Ties tokens to the login session; the client fetches a fresh token before each mutation
  getSessionIdentifier: (req) => {
    const token: unknown = req.cookies?.['refresh_token'];
    return typeof token === 'string' ? token : '';
  },
  cookieName: '__csrf',
  cookieOptions: {
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    path: '/',
  },
  getCsrfTokenFromRequest: (req) => req.headers['x-csrf-token'],
});

export { doubleCsrfProtection, generateCsrfToken };

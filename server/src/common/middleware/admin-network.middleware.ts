import type { NextFunction, Request, Response } from 'express';
import { clientIp, ipAllowed, parseAllowList } from '../utils/client-ip.js';

const ADMIN_PATHS = /^\/api\/(auth|admin)(\/|$)/;

/**
 * With ADMIN_ALLOWED_IPS set, sign-in and every admin route answer 404 to anyone outside the
 * list, matching the frontend's /admin check. Unset means no restriction (development).
 */
export function adminNetworkMiddleware(req: Request, res: Response, next: NextFunction) {
  const allowList = parseAllowList(process.env.ADMIN_ALLOWED_IPS);
  if (!allowList.length || !ADMIN_PATHS.test(req.path) || ipAllowed(clientIp(req), allowList)) {
    return next();
  }
  res.status(404).json({ statusCode: 404, message: 'Not Found' });
}

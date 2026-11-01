import { createHash, randomBytes } from 'node:crypto';

/** SHA-256 hex digest. Fine for high-entropy random tokens; passwords use argon2 instead. */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function randomToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}

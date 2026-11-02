import type { Request } from 'express';

/**
 * The client's IP address. When TRUSTED_CLIENT_IP_HEADER is set (e.g. `cf-connecting-ip` behind
 * Cloudflare, `x-real-ip` behind a proxy that overwrites it) and the request carries it, that
 * header wins; otherwise it's the address of the connection itself. X-Forwarded-For is never
 * read: its first entry is whatever the client chose to send.
 */
export function clientIp(req: Request): string | undefined {
  const headerName = process.env.TRUSTED_CLIENT_IP_HEADER?.trim().toLowerCase();
  const fromHeader = headerName ? req.headers[headerName] : undefined;
  if (typeof fromHeader === 'string' && fromHeader.trim()) return fromHeader.trim();
  return req.socket.remoteAddress;
}

/** Comma-separated IPs / IPv4 CIDR ranges; empty when unset. */
export function parseAllowList(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function ipAllowed(ip: string | undefined, allowList: string[]): boolean {
  return !!ip && allowList.some((entry) => matches(ip, entry));
}

function matches(ip: string, entry: string): boolean {
  const normalized = ip.replace(/^::ffff:/, '');
  if (!entry.includes('/')) return normalized === entry;
  const [range, bitsText] = entry.split('/');
  const bits = Number(bitsText);
  const ipNumber = ipv4ToNumber(normalized);
  const rangeNumber = ipv4ToNumber(range);
  if (ipNumber === undefined || rangeNumber === undefined || !(bits >= 0 && bits <= 32)) {
    return false;
  }
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
  return (ipNumber & mask) >>> 0 === (rangeNumber & mask) >>> 0;
}

function ipv4ToNumber(ip: string): number | undefined {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return undefined;
  }
  return parts.reduce((total, part) => total * 256 + part, 0);
}

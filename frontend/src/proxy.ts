import { NextResponse, type NextRequest } from 'next/server';

/**
 * Hides the admin portal from anyone outside ADMIN_ALLOWED_IPS by answering 404, so the public
 * site gives no hint that it exists. Unset means no restriction (development).
 * The client IP comes from the reverse proxy's X-Forwarded-For / X-Real-IP headers, so only trust
 * this behind a proxy that sets them. See docs/Security.md.
 */
export function proxy(request: NextRequest) {
  const allowList = process.env.ADMIN_ALLOWED_IPS?.split(',').map((entry) => entry.trim()).filter(Boolean);
  if (!allowList?.length) return NextResponse.next();

  const ip = clientIp(request);
  if (ip && allowList.some((entry) => matches(ip, entry))) return NextResponse.next();

  return NextResponse.rewrite(new URL('/admin-not-found', request.url), { status: 404 });
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};

function clientIp(request: NextRequest): string | undefined {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || request.headers.get('x-real-ip')?.trim() || undefined;
}

function matches(ip: string, entry: string): boolean {
  const normalized = ip.replace(/^::ffff:/, '');
  if (!entry.includes('/')) return normalized === entry;
  const [range, bitsText] = entry.split('/');
  const bits = Number(bitsText);
  const ipNumber = ipv4ToNumber(normalized);
  const rangeNumber = ipv4ToNumber(range);
  if (ipNumber === undefined || rangeNumber === undefined || !(bits >= 0 && bits <= 32)) return false;
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

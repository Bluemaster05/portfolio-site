import type { Request } from 'express';
import { clientIp, ipAllowed, parseAllowList } from './client-ip.js';

function request(remoteAddress: string, headers: Record<string, string> = {}): Request {
  return { headers, socket: { remoteAddress } } as unknown as Request;
}

describe('clientIp', () => {
  afterEach(() => {
    delete process.env.TRUSTED_CLIENT_IP_HEADER;
  });

  it('uses the connection address and ignores X-Forwarded-For', () => {
    expect(clientIp(request('10.8.0.2', { 'x-forwarded-for': '1.2.3.4' }))).toBe('10.8.0.2');
  });

  it('prefers the trusted header when configured and present', () => {
    process.env.TRUSTED_CLIENT_IP_HEADER = 'CF-Connecting-IP';
    expect(clientIp(request('127.0.0.1', { 'cf-connecting-ip': '203.0.113.9' }))).toBe('203.0.113.9');
    expect(clientIp(request('10.8.0.2'))).toBe('10.8.0.2');
  });
});

describe('ipAllowed', () => {
  const allowList = parseAllowList(' 10.8.0.0/24, 192.168.1.5 ,');

  it('matches exact IPs and IPv4 ranges, including IPv4-mapped IPv6', () => {
    expect(ipAllowed('10.8.0.200', allowList)).toBe(true);
    expect(ipAllowed('::ffff:10.8.0.3', allowList)).toBe(true);
    expect(ipAllowed('192.168.1.5', allowList)).toBe(true);
  });

  it('rejects everything else', () => {
    expect(ipAllowed('10.8.1.1', allowList)).toBe(false);
    expect(ipAllowed('127.0.0.1', allowList)).toBe(false);
    expect(ipAllowed(undefined, allowList)).toBe(false);
  });
});

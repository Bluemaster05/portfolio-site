import type { Request, Response } from 'express';
import { vi } from 'vitest';
import { adminNetworkMiddleware } from './admin-network.middleware.js';

function run(path: string, remoteAddress: string) {
  const req = { path, headers: {}, socket: { remoteAddress } } as unknown as Request;
  const status = vi.fn(() => ({ json: vi.fn() }));
  const next = vi.fn<() => void>();
  adminNetworkMiddleware(req, { status } as unknown as Response, next);
  return { next, status };
}

describe('adminNetworkMiddleware', () => {
  afterEach(() => {
    delete process.env.ADMIN_ALLOWED_IPS;
  });

  it('lets everything through when no allow-list is set', () => {
    expect(run('/api/admin/projects', '203.0.113.9').next).toHaveBeenCalled();
  });

  it('hides auth and admin routes from addresses outside the list', () => {
    process.env.ADMIN_ALLOWED_IPS = '10.8.0.0/24';
    for (const path of ['/api/auth/login', '/api/admin', '/api/admin/media']) {
      const { next, status } = run(path, '203.0.113.9');
      expect(next).not.toHaveBeenCalled();
      expect(status).toHaveBeenCalledWith(404);
    }
    expect(run('/api/admin/projects', '10.8.0.2').next).toHaveBeenCalled();
  });

  it('leaves public routes alone', () => {
    process.env.ADMIN_ALLOWED_IPS = '10.8.0.0/24';
    expect(run('/api/public/site', '203.0.113.9').next).toHaveBeenCalled();
    expect(run('/api/administrators', '203.0.113.9').next).toHaveBeenCalled();
  });
});

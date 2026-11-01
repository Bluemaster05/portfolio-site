'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Button } from './ui';

export const ADMIN_NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/site', label: 'Site settings' },
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/experience', label: 'Experience' },
  { href: '/admin/education', label: 'Education' },
  { href: '/admin/honors', label: 'Honors & Awards' },
  { href: '/admin/blog', label: 'Blog' },
  { href: '/admin/api-tokens', label: 'API tokens' },
];

interface AdminShellProps {
  pathname: string;
  userEmail?: string;
  onSignOut: () => void;
  children: ReactNode;
}

export function AdminShell({ pathname, userEmail, onSignOut, children }: AdminShellProps) {
  return (
    <div className="min-h-dvh md:grid md:grid-cols-[15rem_1fr]">
      <aside className="border-b border-border bg-surface md:min-h-dvh md:border-b-0 md:border-r">
        <div className="flex items-center justify-between px-5 py-4 md:block">
          <p className="font-semibold tracking-tight">Portfolio admin</p>
          {userEmail && <p className="truncate text-xs text-muted md:mt-1">{userEmail}</p>}
        </div>
        <nav aria-label="Admin" className="px-3 pb-4">
          <ul className="flex gap-1 overflow-x-auto md:grid">
            {ADMIN_NAV.map((item) => {
              const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={`block whitespace-nowrap rounded-md px-3 py-1.5 text-sm ${
                      active ? 'bg-accent-soft font-medium text-foreground' : 'text-muted hover:text-foreground'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-4 flex gap-2 px-1 md:grid">
            <Link href="/" target="_blank" className="text-sm text-muted hover:text-foreground">
              View site ↗
            </Link>
            <Button variant="ghost" onClick={onSignOut} className="justify-start px-0">
              Sign out
            </Button>
          </div>
        </nav>
      </aside>
      <main className="mx-auto w-full max-w-4xl px-5 py-8 md:px-10">{children}</main>
    </div>
  );
}

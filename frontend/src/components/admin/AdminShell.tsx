'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from './ui';

export const ADMIN_NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/site', label: 'Site settings' },
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/technologies', label: 'Technologies' },
  { href: '/admin/experience', label: 'Experience' },
  { href: '/admin/employers', label: 'Employers' },
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
  // Below md the sidebar is a drawer opened from the top bar
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const drawer = useRef<HTMLElement>(null);

  function closeMenu() {
    setMenuOpen(false);
    menuButton.current?.focus();
  }

  // Focus moves into the drawer when it opens; Esc closes it
  useEffect(() => {
    if (!menuOpen) return;
    drawer.current?.querySelector<HTMLElement>('a, button')?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[15rem_1fr]">
      <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-border bg-surface px-3 py-2 md:hidden">
        <button
          ref={menuButton}
          type="button"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          aria-controls="admin-sidebar"
          onClick={() => setMenuOpen(true)}
          className="inline-flex items-center justify-center rounded-md p-2 text-muted transition-colors hover:text-foreground"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-5">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <p className="font-semibold tracking-tight">Portfolio admin</p>
      </header>
      {menuOpen && (
        <div aria-hidden="true" onClick={closeMenu} className="fixed inset-0 z-40 bg-black/60 md:hidden" />
      )}
      {/* Wide screens: the sidebar stays in view, one screen tall, stuck to the top, its own scroll.
          Narrow screens: a drawer from the left, out of view (and out of the tab order) until opened. */}
      <aside
        id="admin-sidebar"
        ref={drawer}
        className={`fixed inset-y-0 left-0 z-50 w-64 max-w-[85vw] overflow-y-auto border-r border-border bg-surface duration-200 md:visible md:sticky md:top-0 md:z-auto md:h-dvh md:w-auto md:max-w-none md:translate-x-0 md:self-start md:transition-none ${
          // Visible at once when opening, so focus can move in; hidden only after sliding out
          menuOpen ? 'visible translate-x-0 transition-[translate]' : 'invisible -translate-x-full transition-[translate,visibility]'
        }`}
      >
        <div className="flex items-start justify-between gap-2 px-5 py-4">
          <div className="min-w-0">
            <p className="font-semibold tracking-tight">Portfolio admin</p>
            {userEmail && <p className="mt-1 truncate text-xs text-muted">{userEmail}</p>}
          </div>
          <button
            type="button"
            aria-label="Close menu"
            onClick={closeMenu}
            className="-mr-2 -mt-1 rounded-md p-1.5 text-muted transition-colors hover:text-foreground md:hidden"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-5">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <nav aria-label="Admin" className="px-3 pb-4">
          <ul className="grid gap-1">
            {ADMIN_NAV.map((item) => {
              const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setMenuOpen(false)}
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
          <div className="mt-4 grid gap-2 px-1">
            <Link href="/" target="_blank" className="text-sm text-muted hover:text-foreground">
              View site ↗
            </Link>
            <Button variant="ghost" onClick={onSignOut} className="justify-start px-0">
              Sign out
            </Button>
            <ThemeToggle className="justify-self-start -mx-1.5" />
          </div>
        </nav>
      </aside>
      <main className="mx-auto w-full max-w-4xl px-5 py-8 md:px-10">{children}</main>
    </div>
  );
}

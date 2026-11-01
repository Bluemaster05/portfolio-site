'use client';

import { useLayoutEffect } from 'react';
import { applyStoredTheme, toggleTheme } from '@/lib/theme';

/**
 * Light/dark switch. The icon is picked by CSS (dark: variant), not React state, so the server
 * HTML is already right for every visitor and hydration never mismatches.
 */
export function ThemeToggle({ className = '' }: { className?: string }) {
  useLayoutEffect(applyStoredTheme, []);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      title="Toggle dark mode"
      className={`inline-flex items-center justify-center rounded-md p-1.5 text-muted transition-colors hover:text-foreground ${className}`}
    >
      {/* Sun in dark mode (switch to light), moon in light mode */}
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="hidden size-[18px] dark:block">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-[18px] dark:hidden">
        <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
      </svg>
    </button>
  );
}

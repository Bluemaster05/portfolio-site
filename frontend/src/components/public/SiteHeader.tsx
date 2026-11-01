import Link from 'next/link';
import { Suspense } from 'react';
import type { SectionInfo } from '@/lib/sections';
import { NavLinks, NavList } from './NavLinks';

interface SiteHeaderProps {
  ownerName: string;
  sections: SectionInfo[];
}

export function SiteHeader({ ownerName, sections }: SiteHeaderProps) {
  const navSections = sections.filter((section) => section.key !== 'home');

  return (
    <header className="border-b border-border">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-5xl flex-wrap items-baseline justify-between gap-x-8 gap-y-2 px-5 py-5"
      >
        <Link href="/" className="font-semibold tracking-tight">
          {ownerName}
        </Link>
        {/* The current path is only known at request time; the plain list ships in the static shell */}
        <Suspense fallback={<NavList sections={navSections} />}>
          <NavLinks sections={navSections} />
        </Suspense>
      </nav>
    </header>
  );
}

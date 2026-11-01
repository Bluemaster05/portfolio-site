'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { SectionInfo } from '@/lib/sections';

/** Nav links with the current page marked. Render inside <Suspense> with <NavList> as fallback. */
export function NavLinks({ sections }: { sections: SectionInfo[] }) {
  return <NavList sections={sections} pathname={usePathname()} />;
}

export function NavList({ sections, pathname }: { sections: SectionInfo[]; pathname?: string }) {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-1 text-[0.95rem]">
      {sections.map((section) => {
        const active =
          pathname !== undefined &&
          (section.href === '/' ? pathname === '/' : pathname.startsWith(section.href));
        return (
          <li key={section.key}>
            <Link
              href={section.href}
              aria-current={active ? 'page' : undefined}
              className={`underline-offset-[6px] transition-colors hover:text-foreground ${
                active ? 'text-foreground underline decoration-accent decoration-2' : 'text-muted'
              }`}
            >
              {section.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

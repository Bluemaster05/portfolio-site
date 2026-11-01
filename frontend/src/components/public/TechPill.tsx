import Link from 'next/link';
import type { ReactNode } from 'react';
import type { TechnologySummary } from '@/lib/api/types';
import { isImageSrc } from '@/lib/images';

const pillClass = 'inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-0.5 text-sm text-foreground';

/** The technology's icon, sized to sit inside a line of text; nothing when it has none. */
export function TechIcon({ technology, size = 'size-4' }: { technology: TechnologySummary; size?: string }) {
  if (!isImageSrc(technology.iconUrl)) return null;
  // Decorative: the name is always shown next to it
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={technology.iconUrl} alt="" className={`${size} shrink-0 object-contain`} />;
}

/** A technology "pin": icon + name. With `href` it links (e.g. to the filtered project list). */
export function TechPill({ technology, href, children }: { technology: TechnologySummary; href?: string; children?: ReactNode }) {
  const content = (
    <>
      <TechIcon technology={technology} />
      {technology.name}
      {children}
    </>
  );
  return href ? (
    <Link href={href} className={`${pillClass} transition-colors hover:bg-accent hover:text-background`}>
      {content}
    </Link>
  ) : (
    <span className={pillClass}>{content}</span>
  );
}

export function TechList({ technologies, linked = false }: { technologies: TechnologySummary[]; linked?: boolean }) {
  if (technologies.length === 0) return null;
  return (
    <ul aria-label="Technologies" className="flex flex-wrap gap-2">
      {technologies.map((technology) => (
        <li key={technology.id}>
          <TechPill technology={technology} href={linked ? `/projects?tech=${technology.slug}` : undefined} />
        </li>
      ))}
    </ul>
  );
}

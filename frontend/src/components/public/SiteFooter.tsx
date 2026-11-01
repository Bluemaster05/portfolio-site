import type { SiteLink } from '@/lib/api/types';

interface SiteFooterProps {
  ownerName: string;
  links: SiteLink[];
  contactEmail?: string;
}

export function SiteFooter({ ownerName, links, contactEmail }: SiteFooterProps) {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-muted">
        <p>{ownerName}</p>
        <ul className="flex flex-wrap gap-x-5 gap-y-1">
          {contactEmail && (
            <li>
              <a href={`mailto:${contactEmail}`} className="hover:text-foreground">
                Email
              </a>
            </li>
          )}
          {links.map((link) => (
            <li key={link.url}>
              <a href={link.url} rel="me noopener noreferrer" className="hover:text-foreground">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}

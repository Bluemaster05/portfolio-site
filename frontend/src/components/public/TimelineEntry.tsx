import type { ReactNode } from 'react';
import { RichTextRenderer } from '@/components/rich-text/RichTextRenderer';
import { isEmptyDoc } from '@/components/rich-text/types';

interface TimelineEntryProps {
  title: string;
  /** Organization, school, or issuer */
  subtitle?: ReactNode;
  /** Dates and location, already formatted */
  meta: (string | undefined)[];
  description?: unknown;
  footer?: ReactNode;
}

/** One row of the experience / education / honors lists. */
export function TimelineEntry({ title, subtitle, meta, description, footer }: TimelineEntryProps) {
  const metaText = meta.filter(Boolean).join(' · ');

  return (
    <article className="grid gap-1 border-l-2 border-border pl-5 animate-fade-up sm:pl-6">
      <h2 className="text-lg font-semibold leading-snug">{title}</h2>
      {subtitle && <p className="font-medium">{subtitle}</p>}
      {metaText && <p className="text-sm text-muted">{metaText}</p>}
      {description !== undefined && !isEmptyDoc(description) && (
        <RichTextRenderer doc={description} className="mt-3" />
      )}
      {footer && <div className="mt-3">{footer}</div>}
    </article>
  );
}

export function Timeline({ children }: { children: ReactNode }) {
  return <div className="grid gap-10">{children}</div>;
}

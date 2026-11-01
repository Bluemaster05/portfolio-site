import Link from 'next/link';
import type { HonorSummary } from '@/lib/api/types';
import { formatPartialDate } from '@/lib/format';
import { isImageSrc } from '@/lib/images';
import { RichTextRenderer } from '@/components/rich-text/RichTextRenderer';
import { isEmptyDoc } from '@/components/rich-text/types';
import { Tooltip } from './Tooltip';

/** The honor's "View credential" link (certificate or announcement), when it has one. */
export function CredentialLink({ url }: { url?: string }) {
  if (!url) return null;
  return (
    <Tooltip label="Certificate or announcement">
      <a href={url} className="text-sm text-accent underline underline-offset-4" rel="noopener noreferrer">
        View credential
      </a>
    </Tooltip>
  );
}

/** The honor's main image; nothing when it has none. Alt falls back to the title. */
export function HonorImage({
  honor,
  className,
}: {
  honor: Pick<HonorSummary, 'imageUrl' | 'imageAlt' | 'title'>;
  className: string;
}) {
  if (!isImageSrc(honor.imageUrl)) return null;
  return (
    // Uploads or any http(s) host, so next/image's allow-list doesn't fit
    // eslint-disable-next-line @next/next/no-img-element
    <img src={honor.imageUrl} alt={honor.imageAlt || honor.title} loading="lazy" className={className} />
  );
}

/**
 * One honor as a card, laid out like the experience cards; the title links to its page. A main
 * image sits beside the text on wide screens and above it on narrow ones.
 */
export function HonorCard({ honor }: { honor: HonorSummary }) {
  return (
    <article className="flex flex-col gap-5 rounded-card border border-border bg-surface p-5 animate-fade-up sm:flex-row sm:p-6">
      <HonorImage
        honor={honor}
        className="aspect-[4/3] w-full shrink-0 rounded-md border border-border bg-background object-cover sm:w-44"
      />
      <div className="min-w-0 flex-1">
        <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 className="min-w-0 text-xl font-semibold leading-snug">
            <Tooltip label="Read more">
              <Link href={`/honors/${honor.slug}`} className="hover:text-accent hover:underline underline-offset-4">
                {honor.title}
              </Link>
            </Tooltip>
          </h2>
          {honor.date && <p className="text-sm text-muted">{formatPartialDate(honor.date)}</p>}
        </header>
        {honor.issuer && <p className="mt-1 font-medium">{honor.issuer}</p>}
        {!isEmptyDoc(honor.description) && <RichTextRenderer doc={honor.description} className="mt-3" />}
        {honor.url && (
          <div className="mt-4">
            <CredentialLink url={honor.url} />
          </div>
        )}
      </div>
    </article>
  );
}

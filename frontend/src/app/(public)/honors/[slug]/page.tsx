import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { getHonor } from '@/lib/api/public-data';
import { formatPartialDate } from '@/lib/format';
import { RichTextRenderer } from '@/components/rich-text/RichTextRenderer';
import { isEmptyDoc } from '@/components/rich-text/types';
import { CredentialLink, HonorImage } from '@/components/public/HonorCard';
import { ImageCarousel } from '@/components/public/ImageCarousel';
import { isImageSrc } from '@/lib/images';

export async function generateMetadata(props: PageProps<'/honors/[slug]'>): Promise<Metadata> {
  const { slug } = await props.params;
  const honor = await getHonor(slug);
  if (!honor) return {};
  return { title: honor.title };
}

export default function HonorPage(props: PageProps<'/honors/[slug]'>) {
  return (
    <Suspense fallback={<p className="text-muted">Loading…</p>}>
      <HonorDetails params={props.params} />
    </Suspense>
  );
}

async function HonorDetails({ params }: Pick<PageProps<'/honors/[slug]'>, 'params'>) {
  const { slug } = await params;
  const honor = await getHonor(slug);
  if (!honor) notFound();

  const meta = [honor.issuer, formatPartialDate(honor.date)].filter(Boolean).join(' · ');

  return (
    <article className="animate-fade-up">
      <Link href="/honors" className="text-sm text-muted hover:text-foreground">
        ← All honors &amp; awards
      </Link>
      <header className="mb-6 mt-3 grid gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">{honor.title}</h1>
        {meta && <p className="text-lg text-muted">{meta}</p>}
        {honor.url && (
          <p>
            <CredentialLink url={honor.url} />
          </p>
        )}
      </header>

      <HonorImage
        honor={honor}
        className="mb-8 max-h-[min(50vh,28rem)] w-full rounded-card border border-border bg-surface object-contain"
      />

      {!isEmptyDoc(honor.description) && <RichTextRenderer doc={honor.description} className="text-lg" />}

      <ImageCarousel label="More images" images={honor.images.filter((image) => isImageSrc(image.url))} />

      {!isEmptyDoc(honor.writeup) && (
        <div className="mt-10 border-t border-border pt-8">
          <RichTextRenderer doc={honor.writeup} />
        </div>
      )}
    </article>
  );
}

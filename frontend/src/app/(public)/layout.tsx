import type { Metadata } from 'next';
import { getSite } from '@/lib/api/public-data';
import { enabledSections } from '@/lib/sections';
import { SiteHeader } from '@/components/public/SiteHeader';
import { SiteFooter } from '@/components/public/SiteFooter';

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  const title = site?.siteTitle ?? 'Portfolio';
  return {
    title: { default: title, template: `%s · ${title}` },
    description: site?.siteDescription || undefined,
    openGraph: { title, description: site?.siteDescription || undefined, type: 'website' },
  };
}

export default async function PublicLayout({ children }: LayoutProps<'/'>) {
  const site = await getSite();
  const ownerName = site?.ownerName ?? 'Portfolio';

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded focus:bg-surface focus:px-3 focus:py-2"
      >
        Skip to content
      </a>
      <SiteHeader ownerName={ownerName} sections={enabledSections(site?.sections)} />
      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-5 pt-4 sm:pt-6">
        {children}
      </main>
      <SiteFooter ownerName={ownerName} links={site?.links ?? []} contactEmail={site?.contactEmail} />
    </div>
  );
}

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AdminProviders } from '@/components/admin/AdminProviders';

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<'/admin'>) {
  return (
    <AdminProviders>
      {/* Admin pages are client-rendered after sign-in; nothing here belongs in the static shell */}
      <Suspense fallback={<p className="p-8 text-muted">Loading…</p>}>{children}</Suspense>
    </AdminProviders>
  );
}

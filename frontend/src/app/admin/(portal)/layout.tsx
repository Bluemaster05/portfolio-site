'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { $api } from '@/lib/api/admin-query';
import { AdminShell } from '@/components/admin/AdminShell';

/** Signed-in area: sends visitors without a session to the login page. */
export default function AdminPortalLayout({ children }: LayoutProps<'/admin'>) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const me = $api.useQuery('get', '/api/auth/me', {}, { retry: false });
  const logout = $api.useMutation('post', '/api/auth/logout', {
    onSettled: () => {
      queryClient.clear();
      router.replace('/admin/login');
    },
  });

  useEffect(() => {
    if (me.isError) router.replace('/admin/login');
  }, [me.isError, router]);

  if (!me.data) return <p className="p-8 text-muted">Loading…</p>;

  return (
    <AdminShell pathname={pathname} userEmail={me.data.email} onSignOut={() => logout.mutate({})}>
      {children}
    </AdminShell>
  );
}

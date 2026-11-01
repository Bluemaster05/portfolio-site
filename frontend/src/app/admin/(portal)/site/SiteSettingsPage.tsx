'use client';

import { useQueryClient } from '@tanstack/react-query';
import { $api } from '@/lib/api/admin-query';
import { errorMessage } from '@/lib/admin/api-error';
import { uploadMedia } from '@/lib/admin/media';
import { AdminPageHeader, ErrorBanner } from '@/components/admin/ui';
import { SiteSettingsForm } from '@/components/admin/SiteSettingsForm';

export function SiteSettingsPage() {
  const queryClient = useQueryClient();
  const settings = $api.useQuery('get', '/api/admin/site');
  const save = $api.useMutation('patch', '/api/admin/site', {
    onSuccess: (updated) => queryClient.setQueryData($api.queryOptions('get', '/api/admin/site').queryKey, updated),
  });

  return (
    <>
      <AdminPageHeader title="Site settings" />
      {settings.data ? (
        <SiteSettingsForm
          settings={settings.data}
          saving={save.isPending}
          saved={save.isSuccess}
          error={errorMessage(save.error)}
          onSubmit={(body) => save.mutate({ body })}
          onUpload={uploadMedia}
        />
      ) : settings.isError ? (
        <ErrorBanner message={errorMessage(settings.error)} />
      ) : (
        <p className="text-muted">Loading…</p>
      )}
    </>
  );
}

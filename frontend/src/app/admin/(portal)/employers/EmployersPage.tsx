'use client';

import { $api } from '@/lib/api/admin-query';
import { errorMessage } from '@/lib/admin/api-error';
import { uploadMedia } from '@/lib/admin/media';
import { AdminPageHeader } from '@/components/admin/ui';
import { EmployersView, type EmployerDraft } from '@/components/admin/EmployersView';

export function EmployersPage() {
  const employers = $api.useQuery('get', '/api/admin/employers');
  const refresh = () => employers.refetch();
  const create = $api.useMutation('post', '/api/admin/employers', { onSuccess: refresh });
  const update = $api.useMutation('patch', '/api/admin/employers/{id}', { onSuccess: refresh });
  const remove = $api.useMutation('delete', '/api/admin/employers/{id}', { onSuccess: refresh });
  const reorder = $api.useMutation('put', '/api/admin/employers/order', { onSuccess: refresh });

  const items = employers.data ?? [];
  // '' clears the logo or link on the server
  const body = (draft: EmployerDraft) => ({ name: draft.name, logoUrl: draft.logoUrl, url: draft.url.trim() });

  return (
    <>
      <AdminPageHeader title="Employers" />
      <EmployersView
        employers={items}
        busy={create.isPending || update.isPending || remove.isPending || reorder.isPending}
        error={errorMessage(employers.error ?? create.error ?? update.error ?? remove.error ?? reorder.error)}
        onCreate={async (draft) => {
          await create.mutateAsync({ body: body(draft) });
        }}
        onUpdate={async (id, draft) => {
          await update.mutateAsync({ params: { path: { id } }, body: body(draft) });
        }}
        onDelete={(id) => remove.mutate({ params: { path: { id } } })}
        onMove={(index, direction) => {
          const ids = items.map((employer) => employer.id);
          [ids[index], ids[index + direction]] = [ids[index + direction], ids[index]];
          reorder.mutate({ body: { ids } });
        }}
        onUpload={uploadMedia}
      />
    </>
  );
}

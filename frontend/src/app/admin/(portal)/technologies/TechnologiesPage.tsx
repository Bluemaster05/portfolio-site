'use client';

import { $api } from '@/lib/api/admin-query';
import { errorMessage } from '@/lib/admin/api-error';
import { uploadMedia } from '@/lib/admin/media';
import { AdminPageHeader } from '@/components/admin/ui';
import { TechnologiesView, type TechnologyDraft } from '@/components/admin/TechnologiesView';

export function TechnologiesPage() {
  const technologies = $api.useQuery('get', '/api/admin/technologies');
  const refresh = () => technologies.refetch();
  const create = $api.useMutation('post', '/api/admin/technologies', { onSuccess: refresh });
  const update = $api.useMutation('patch', '/api/admin/technologies/{id}', { onSuccess: refresh });
  const remove = $api.useMutation('delete', '/api/admin/technologies/{id}', { onSuccess: refresh });
  const reorder = $api.useMutation('put', '/api/admin/technologies/order', { onSuccess: refresh });

  const items = technologies.data ?? [];
  // '' clears the icon or link on the server
  const body = (draft: TechnologyDraft) => ({ name: draft.name, iconUrl: draft.iconUrl, url: draft.url.trim() });

  return (
    <>
      <AdminPageHeader title="Technologies" />
      <TechnologiesView
        technologies={items}
        busy={create.isPending || update.isPending || remove.isPending || reorder.isPending}
        error={errorMessage(technologies.error ?? create.error ?? update.error ?? remove.error ?? reorder.error)}
        onCreate={async (draft) => {
          await create.mutateAsync({ body: body(draft) });
        }}
        onUpdate={async (id, draft) => {
          await update.mutateAsync({ params: { path: { id } }, body: body(draft) });
        }}
        onDelete={(id) => remove.mutate({ params: { path: { id } } })}
        onMove={(index, direction) => {
          const ids = items.map((technology) => technology.id);
          [ids[index], ids[index + direction]] = [ids[index + direction], ids[index]];
          reorder.mutate({ body: { ids } });
        }}
        onUpload={uploadMedia}
      />
    </>
  );
}

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { errorMessage } from '@/lib/admin/api-error';
import type { FormValues } from '@/lib/admin/form-values';
import { uploadMedia } from '@/lib/admin/media';
import type { ContentItemBase, ContentResource } from '@/lib/admin/resources/resource';
import { ContentList } from '@/components/admin/content/ContentList';
import { ContentForm } from '@/components/admin/content/ContentForm';
import { AdminPageHeader, ErrorBanner } from '@/components/admin/ui';

export function ContentListContainer<Item extends ContentItemBase>({ resource }: { resource: ContentResource<Item> }) {
  const queryClient = useQueryClient();
  const items = useQuery({ queryKey: [resource.key], queryFn: resource.api.list });
  const refresh = () => queryClient.invalidateQueries({ queryKey: [resource.key] });

  const reorder = useMutation({ mutationFn: resource.api.reorder, onSuccess: refresh });
  const publish = useMutation({
    mutationFn: ({ id, published }: { id: number; published: boolean }) => resource.api.setPublished(id, published),
    onSuccess: refresh,
  });
  const remove = useMutation({ mutationFn: resource.api.remove, onSuccess: refresh });

  function move(index: number, direction: -1 | 1) {
    const ids = (items.data ?? []).map((item) => item.id);
    const target = index + direction;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    reorder.mutate(ids);
  }

  return (
    <>
      <AdminPageHeader
        title={resource.label}
        actions={
          <Link href={`/admin/${resource.key}/new`} className="rounded-md bg-accent px-3.5 py-2 text-sm font-medium text-background hover:opacity-90">
            New {resource.singular}
          </Link>
        }
      />
      <ErrorBanner message={errorMessage(items.error ?? reorder.error ?? publish.error ?? remove.error)} />
      {items.isPending ? (
        <p className="text-muted">Loading…</p>
      ) : (
        <ContentList
          rows={(items.data ?? []).map((item) => ({ id: item.id, published: item.published, ...resource.describe(item) }))}
          editHref={(id) => `/admin/${resource.key}/${id}`}
          singular={resource.singular}
          busy={reorder.isPending || publish.isPending || remove.isPending}
          onMove={move}
          onTogglePublished={(id, published) => publish.mutate({ id, published })}
          onDelete={(id) => remove.mutate(id)}
        />
      )}
    </>
  );
}

export function ContentEditContainer<Item extends ContentItemBase>({
  resource,
  id,
}: {
  resource: ContentResource<Item>;
  /** Undefined when creating */
  id?: number;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const item = useQuery({
    queryKey: [resource.key, id],
    queryFn: () => resource.api.get(id ?? 0),
    enabled: id !== undefined,
  });

  const save = useMutation({
    mutationFn: (values: FormValues) => (id === undefined ? resource.api.create(values) : resource.api.update(id, values)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [resource.key] });
      router.push(`/admin/${resource.key}`);
    },
  });

  const title = id === undefined ? `New ${resource.singular}` : `Edit ${resource.singular}`;

  if (id !== undefined && item.isPending) return <p className="text-muted">Loading…</p>;
  if (id !== undefined && !item.data) return <ErrorBanner message={errorMessage(item.error) ?? 'Not found'} />;

  return (
    <>
      <AdminPageHeader title={title} />
      <ContentForm
        // Remount when a different item loads so the form starts from its values
        key={id ?? 'new'}
        fields={resource.fields}
        initialValues={resource.toValues(item.data)}
        submitLabel={id === undefined ? 'Create' : 'Save changes'}
        submitting={save.isPending}
        error={errorMessage(save.error)}
        onSubmit={(values) => save.mutate(values)}
        onCancel={() => router.push(`/admin/${resource.key}`)}
        onUpload={uploadMedia}
      />
    </>
  );
}

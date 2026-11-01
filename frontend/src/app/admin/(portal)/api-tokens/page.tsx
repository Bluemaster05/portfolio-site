'use client';

import { $api } from '@/lib/api/admin-query';
import { errorMessage } from '@/lib/admin/api-error';
import { AdminPageHeader } from '@/components/admin/ui';
import { ApiTokensView } from '@/components/admin/ApiTokensView';

export default function AdminApiTokensPage() {
  const tokens = $api.useQuery('get', '/api/admin/api-tokens');
  const refresh = () => tokens.refetch();
  const create = $api.useMutation('post', '/api/admin/api-tokens', { onSuccess: refresh });
  const revoke = $api.useMutation('post', '/api/admin/api-tokens/{id}/revoke', { onSuccess: refresh });
  const remove = $api.useMutation('delete', '/api/admin/api-tokens/{id}', { onSuccess: refresh });

  return (
    <>
      <AdminPageHeader title="API tokens" />
      <ApiTokensView
        tokens={tokens.data ?? []}
        createdToken={create.data?.token}
        creating={create.isPending}
        busy={revoke.isPending || remove.isPending}
        error={errorMessage(tokens.error ?? create.error ?? revoke.error ?? remove.error)}
        onCreate={(name, scopes) => create.mutate({ body: { name, scopes } })}
        onRevoke={(id) => revoke.mutate({ params: { path: { id } } })}
        onDelete={(id) => remove.mutate({ params: { path: { id } } })}
      />
    </>
  );
}

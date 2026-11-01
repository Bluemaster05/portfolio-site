import createQueryClient from 'openapi-react-query';
import { adminClient } from './admin-client';

/**
 * Typed React Query hooks for the admin portal:
 * `$api.useQuery('get', '/api/admin/projects')`, `$api.useMutation('patch', '/api/admin/projects/{id}')`.
 */
export const $api = createQueryClient(adminClient);

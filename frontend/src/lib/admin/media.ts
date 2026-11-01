import { adminClient } from '@/lib/api/admin-client';
import { unwrap } from './api-error';

/** Accepted by the API; the server checks file contents, this only filters the file picker. */
export const IMAGE_ACCEPT = 'image/png,image/jpeg,image/gif,image/webp,image/avif,image/svg+xml';

/**
 * Uploads an image and resolves to the site-relative URL to store in content (`/media/<key>`).
 * Presenters receive this as an `onUpload` prop rather than importing it.
 */
export async function uploadImage(file: File): Promise<string> {
  const asset = unwrap(
    await adminClient.POST('/api/admin/media', {
      body: {},
      bodySerializer: () => {
        const form = new FormData();
        form.append('file', file);
        return form;
      },
    }),
  );
  return asset.url;
}

export type UploadImage = (file: File) => Promise<string>;

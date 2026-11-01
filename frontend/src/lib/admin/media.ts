import { adminClient } from '@/lib/api/admin-client';
import { unwrap } from './api-error';

/** Accepted by the API; the server checks file contents, these only filter the file picker. */
export const IMAGE_ACCEPT = 'image/png,image/jpeg,image/gif,image/webp,image/avif,image/svg+xml';
export const VIDEO_ACCEPT = 'video/mp4,video/webm';

/**
 * Uploads an image or video and resolves to the site-relative URL to store in content
 * (`/media/<key>`). Presenters receive this as an `onUpload` prop rather than importing it.
 */
export async function uploadMedia(file: File): Promise<string> {
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

export type UploadMedia = (file: File) => Promise<string>;

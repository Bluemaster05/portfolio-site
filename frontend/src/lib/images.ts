/** Uploaded images are served from this site at /media/<key> (proxied to the API). */
export const MEDIA_PREFIX = '/media/';

export function isUploadedImage(src: string): boolean {
  return src.startsWith(MEDIA_PREFIX);
}

/** Image sources the site will render: uploads or absolute http(s) URLs. */
export function isImageSrc(src: string | undefined): src is string {
  if (!src) return false;
  return /^https?:\/\/\S+$/i.test(src) || /^\/media\/[A-Za-z0-9._-]+$/.test(src);
}

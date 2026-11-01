/** Uploaded files are served from this site at /media/<key> (proxied to the API). */
export const MEDIA_PREFIX = '/media/';

export function isUploadedMedia(src: string): boolean {
  return src.startsWith(MEDIA_PREFIX);
}

const EXTERNAL = /^https?:\/\/\S+$/i;
const UPLOADED_IMAGE = /^\/media\/[A-Za-z0-9_-]+\.(png|jpg|gif|webp|avif|svg)$/i;
const UPLOADED_VIDEO = /^\/media\/[A-Za-z0-9_-]+\.(mp4|webm)$/i;

/** Image sources the site will render: uploaded images or absolute http(s) URLs. */
export function isImageSrc(src: string | undefined): src is string {
  return !!src && (EXTERNAL.test(src) || UPLOADED_IMAGE.test(src));
}

/** Video sources the site will render: uploaded MP4/WebM or absolute http(s) URLs. */
export function isVideoSrc(src: string | undefined): src is string {
  return !!src && (EXTERNAL.test(src) || UPLOADED_VIDEO.test(src));
}

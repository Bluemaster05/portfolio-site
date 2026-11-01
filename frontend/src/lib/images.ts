/** Uploaded files are served from this site at /media/<key> (proxied to the API). */
export const MEDIA_PREFIX = '/media/';

export function isUploadedMedia(src: string): boolean {
  return src.startsWith(MEDIA_PREFIX);
}

const EXTERNAL = /^https?:\/\/\S+$/i;
const UPLOADED_IMAGE = /^\/media\/[A-Za-z0-9_-]+\.(png|jpg|gif|webp|avif|svg)$/i;
const UPLOADED_VIDEO = /^\/media\/[A-Za-z0-9_-]+\.(mp4|webm)$/i;
const VIDEO_FILE = /\.(mp4|webm|m4v|mov)(\?.*)?$/i;

/** Image sources the site will render: uploaded images or absolute http(s) URLs. */
export function isImageSrc(src: string | undefined): src is string {
  return !!src && (EXTERNAL.test(src) || UPLOADED_IMAGE.test(src));
}

/** Video sources the site will render: uploaded MP4/WebM or absolute http(s) URLs. */
export function isVideoSrc(src: string | undefined): src is string {
  return !!src && (EXTERNAL.test(src) || UPLOADED_VIDEO.test(src));
}

/** Best guess at whether a URL is a video, from its file extension. */
export function looksLikeVideo(src: string): boolean {
  return VIDEO_FILE.test(src);
}

/**
 * A video URL that makes browsers show its first frame before playing (no separate poster).
 * The fragment never reaches the server.
 */
export function firstFrame(src: string): string {
  return src.includes('#') ? src : `${src}#t=0.1`;
}

interface MediaLike {
  kind: 'image' | 'video';
  url: string;
}

/** Items the site can render: each URL checked against its kind. */
export function renderableMedia<T extends MediaLike>(media: T[]): T[] {
  return media.filter((item) => (item.kind === 'video' ? isVideoSrc(item.url) : isImageSrc(item.url)));
}

/** The cover for cards and the home page: always the first image, never a video. */
export function firstImage<T extends MediaLike>(media: T[]): T | undefined {
  return renderableMedia(media).find((item) => item.kind === 'image');
}

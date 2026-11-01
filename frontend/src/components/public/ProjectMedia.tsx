import type { ProjectImage, ProjectMediaLayout } from '@/lib/api/types';
import { isImageSrc, isVideoSrc } from '@/lib/images';
import { ProjectGallery } from './ProjectGallery';

interface ProjectMediaProps {
  layout: ProjectMediaLayout;
  images: ProjectImage[];
  /** Main video; on this page it takes the main spot, with the first image as its poster */
  videoUrl?: string;
  /** Accessible name for the video */
  title: string;
}

/** The project's header image, video, or gallery, per the layout chosen in the admin portal. */
export function ProjectMedia({ layout, images, videoUrl, title }: ProjectMediaProps) {
  const shown = images.filter((image) => isImageSrc(image.url));
  const video = isVideoSrc(videoUrl) ? videoUrl : undefined;
  if (layout === 'none' || (shown.length === 0 && !video)) return null;

  if (layout === 'gallery' && shown.length + (video ? 1 : 0) > 1) {
    return <ProjectGallery images={shown} videoUrl={video} title={title} />;
  }

  if (video) {
    return (
      <figure className="mb-8">
        <video
          src={video}
          poster={shown[0]?.url}
          controls
          playsInline
          preload="metadata"
          aria-label={`${title} video`}
          className="h-[min(48vh,28rem)] w-full rounded-card border border-border bg-black object-contain"
        />
      </figure>
    );
  }

  const [image] = shown;
  return (
    <figure className="mb-8">
      {/* Uploads and external hosts both appear here, so next/image's allow-list doesn't fit */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.url}
        alt={image.alt ?? ''}
        className="max-h-[min(52vh,30rem)] w-auto max-w-full rounded-card border border-border bg-surface object-contain"
      />
    </figure>
  );
}

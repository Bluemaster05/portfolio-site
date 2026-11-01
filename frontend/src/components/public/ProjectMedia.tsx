import type { ProjectImage, ProjectMediaLayout } from '@/lib/api/types';
import { isImageSrc } from '@/lib/images';
import { ProjectGallery } from './ProjectGallery';

interface ProjectMediaProps {
  layout: ProjectMediaLayout;
  images: ProjectImage[];
}

/** The project's header image or gallery, per the layout chosen in the admin portal. */
export function ProjectMedia({ layout, images }: ProjectMediaProps) {
  const shown = images.filter((image) => isImageSrc(image.url));
  if (layout === 'none' || shown.length === 0) return null;

  if (layout === 'single' || shown.length === 1) {
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

  return <ProjectGallery images={shown} />;
}

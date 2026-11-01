import type { ProjectMediaItem, ProjectMediaLayout } from '@/lib/api/types';
import { firstFrame, renderableMedia } from '@/lib/images';
import { ProjectGallery } from './ProjectGallery';

interface ProjectMediaProps {
  layout: ProjectMediaLayout;
  media: ProjectMediaItem[];
  /** Accessible name for videos without a description */
  title: string;
}

/** The project's header item (image or video) or gallery, per the layout chosen in the admin. */
export function ProjectMedia({ layout, media, title }: ProjectMediaProps) {
  const items = renderableMedia(media);
  if (layout === 'none' || items.length === 0) return null;
  if (layout === 'gallery' && items.length > 1) return <ProjectGallery items={items} title={title} />;

  const [item] = items;
  return (
    <figure className="mb-8">
      {item.kind === 'video' ? (
        <video
          src={firstFrame(item.url)}
          controls
          playsInline
          preload="metadata"
          aria-label={item.alt || `${title} video`}
          className="h-[min(48vh,28rem)] w-full rounded-card border border-border bg-black object-contain"
        />
      ) : (
        // Uploads and external hosts both appear here, so next/image's allow-list doesn't fit
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.url}
          alt={item.alt ?? ''}
          className="max-h-[min(52vh,30rem)] w-auto max-w-full rounded-card border border-border bg-surface object-contain"
        />
      )}
    </figure>
  );
}

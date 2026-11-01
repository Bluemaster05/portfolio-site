'use client';

import { useState } from 'react';
import type { ProjectImage } from '@/lib/api/types';

type GalleryItem = { kind: 'video'; url: string; poster?: string } | { kind: 'image'; url: string; alt?: string };

interface ProjectGalleryProps {
  images: ProjectImage[];
  /** Shown first, in the large spot, with the first image as its poster */
  videoUrl?: string;
  title: string;
}

/**
 * The main item large (the video when there is one, else the first image) with every item as a
 * smaller tile below. Choosing a tile shows it in the large spot.
 */
export function ProjectGallery({ images, videoUrl, title }: ProjectGalleryProps) {
  const items: GalleryItem[] = [
    ...(videoUrl ? [{ kind: 'video' as const, url: videoUrl, poster: images[0]?.url }] : []),
    ...images.map((image) => ({ kind: 'image' as const, url: image.url, alt: image.alt })),
  ];
  const [selected, setSelected] = useState(0);
  const main = items[selected] ?? items[0];
  const mainClass = 'h-[min(48vh,28rem)] w-full rounded-card border border-border object-contain animate-fade-up';

  return (
    <section aria-label="Project media" className="mb-8 grid gap-2">
      {main.kind === 'video' ? (
        <video
          key={main.url}
          src={main.url}
          poster={main.poster}
          controls
          playsInline
          preload="metadata"
          aria-label={`${title} video`}
          className={`${mainClass} bg-black`}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={main.url} src={main.url} alt={main.alt ?? ''} className={`${mainClass} bg-surface`} />
      )}
      <ul className="grid max-w-xl grid-cols-5 gap-2">
        {items.map((item, index) => (
          <li key={`${item.kind}-${item.url}-${index}`}>
            <button
              type="button"
              onClick={() => setSelected(index)}
              aria-label={
                item.kind === 'video'
                  ? 'Show the video'
                  : `Show image ${index + (videoUrl ? 0 : 1)}${item.alt ? `: ${item.alt}` : ''}`
              }
              aria-pressed={index === selected}
              className={`relative block w-full overflow-hidden rounded-md border-2 transition-colors ${
                index === selected ? 'border-accent' : 'border-transparent hover:border-border'
              }`}
            >
              {item.kind === 'video' ? (
                <>
                  {item.poster ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.poster}
                      alt=""
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover brightness-75"
                    />
                  ) : (
                    <span className="block aspect-[4/3] w-full bg-black" />
                  )}
                  <span aria-hidden className="absolute inset-0 grid place-items-center">
                    <span className="grid size-8 place-items-center rounded-full bg-black/70 pl-0.5 text-sm text-white">
                      ▶
                    </span>
                  </span>
                </>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.url} alt="" loading="lazy" className="aspect-[4/3] w-full bg-surface object-cover" />
              )}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

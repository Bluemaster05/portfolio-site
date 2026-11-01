'use client';

import { useState } from 'react';
import type { ProjectMediaItem } from '@/lib/api/types';
import { firstFrame } from '@/lib/images';

interface ProjectGalleryProps {
  /** Images and videos in tile order */
  items: ProjectMediaItem[];
  /** Item shown large to start: the main video, else the main image */
  initialIndex: number;
  /** Accessible name for videos without a description */
  title: string;
}

/**
 * The selected item large with every item as a smaller tile below. Videos preview their first
 * frame and never autoplay; choosing a tile shows it in the large spot.
 */
export function ProjectGallery({ items, initialIndex, title }: ProjectGalleryProps) {
  const [selected, setSelected] = useState(initialIndex);
  const main = items[selected] ?? items[0];
  const mainClass = 'h-[min(48vh,28rem)] w-full rounded-card border border-border object-contain animate-fade-up';
  let imageNumber = 0;
  let videoNumber = 0;

  return (
    <section aria-label="Project media" className="mb-8 grid gap-2">
      {main.kind === 'video' ? (
        <video
          key={main.url}
          src={firstFrame(main.url)}
          controls
          playsInline
          preload="metadata"
          aria-label={main.alt || `${title} video`}
          className={`${mainClass} bg-black`}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={main.url} src={main.url} alt={main.alt ?? ''} className={`${mainClass} bg-surface`} />
      )}
      <ul className="grid max-w-xl grid-cols-5 gap-2">
        {items.map((item, index) => {
          const number = item.kind === 'video' ? ++videoNumber : ++imageNumber;
          return (
            <li key={`${item.kind}-${item.url}-${index}`}>
              <button
                type="button"
                onClick={() => setSelected(index)}
                aria-label={`Show ${item.kind} ${number}${item.alt ? `: ${item.alt}` : ''}`}
                aria-pressed={index === selected}
                className={`relative block w-full overflow-hidden rounded-md border-2 transition-colors ${
                  index === selected ? 'border-accent' : 'border-transparent hover:border-border'
                }`}
              >
                {item.kind === 'video' ? (
                  <>
                    <video
                      src={firstFrame(item.url)}
                      preload="metadata"
                      muted
                      playsInline
                      tabIndex={-1}
                      className="pointer-events-none aspect-[4/3] w-full bg-black object-cover"
                    />
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
          );
        })}
      </ul>
    </section>
  );
}

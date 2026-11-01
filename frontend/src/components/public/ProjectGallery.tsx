'use client';

import { useState } from 'react';
import type { ProjectImage } from '@/lib/api/types';

/**
 * The first image large, the rest as smaller tiles below it. Choosing a tile shows that image
 * in the large spot; without JavaScript the first image and all tiles still show.
 */
export function ProjectGallery({ images }: { images: ProjectImage[] }) {
  const [selected, setSelected] = useState(0);
  const main = images[selected] ?? images[0];

  return (
    <section aria-label="Project images" className="mb-8 grid gap-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={main.url}
        src={main.url}
        alt={main.alt ?? ''}
        className="h-[min(48vh,28rem)] w-full rounded-card border border-border bg-surface object-contain animate-fade-up"
      />
      <ul className="grid max-w-xl grid-cols-5 gap-2">
        {images.map((image, index) => (
          <li key={`${image.url}-${index}`}>
            <button
              type="button"
              onClick={() => setSelected(index)}
              aria-label={`Show image ${index + 1}${image.alt ? `: ${image.alt}` : ''}`}
              aria-pressed={index === selected}
              className={`block w-full overflow-hidden rounded-md border-2 transition-colors ${
                index === selected ? 'border-accent' : 'border-transparent hover:border-border'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt="" loading="lazy" className="aspect-[4/3] w-full bg-surface object-cover" />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

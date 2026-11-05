'use client';

import { useId, useState, type KeyboardEvent } from 'react';
import { MediaLightbox } from '@/components/MediaLightbox';

export interface CarouselImage {
  url: string;
  alt?: string;
}

/** Where a slide sits relative to the selected one: 0 centered, ±1 beside it, else hidden. */
function offsetOf(index: number, active: number, count: number): number {
  let offset = index - active;
  // Wrap around, so the last image sits left of the first
  if (offset > count / 2) offset -= count;
  if (offset < -count / 2) offset += count;
  return offset;
}

const SLIDE_POSITION: Record<string, string> = {
  '-1': '-translate-x-[118%] scale-[0.82] opacity-35',
  '0': 'translate-x-[-50%] scale-100 opacity-100',
  '1': 'translate-x-[18%] scale-[0.82] opacity-35',
};

/**
 * Images one at a time: the selected one centered, faded copies of its neighbours to each side,
 * its description below the arrows. Arrows (buttons or keys) and clicking a neighbour move between
 * them with a short slide; the global reduced-motion rule turns the motion off. Clicking the
 * selected image opens it full size.
 */
export function ImageCarousel({
  images,
  label = 'Images',
  captions = true,
}: {
  images: CarouselImage[];
  label?: string;
  /** Show the selected image's alt text below the arrows (the full-size view always shows it) */
  captions?: boolean;
}) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const id = useId();
  const count = images.length;
  if (count === 0) return null;
  const hasCaptions = captions && images.some((image) => image.alt);

  const go = (step: number) => setActive((current) => (current + step + count) % count);

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      go(event.key === 'ArrowLeft' ? -1 : 1);
    }
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label={label}
      onKeyDown={onKeyDown}
      className="not-prose my-8 grid gap-3"
    >
      <div className="relative aspect-[16/9] overflow-hidden rounded-card">
        {images.map((image, index) => {
          const offset = offsetOf(index, active, count);
          const visible = Math.abs(offset) <= 1;
          const position =
            SLIDE_POSITION[String(offset)] ??
            (offset < 0 ? '-translate-x-[180%] scale-75 opacity-0' : 'translate-x-[80%] scale-75 opacity-0');
          const isActive = offset === 0;
          return (
            <button
              key={`${image.url}-${index}`}
              type="button"
              aria-hidden={!isActive}
              aria-label={isActive ? `View full size${image.alt ? `: ${image.alt}` : ''}` : undefined}
              tabIndex={isActive ? 0 : -1}
              disabled={!visible}
              onClick={() => (isActive ? setZoomed(true) : setActive(index))}
              className={`absolute left-1/2 top-0 h-full w-[72%] transition-[translate,scale,opacity] duration-[400ms] ease-out sm:w-[64%] ${position} ${
                isActive ? 'z-10 cursor-zoom-in' : 'z-0 cursor-pointer'
              }`}
            >
              {/* Uploads or any http(s) host, so next/image's allow-list doesn't fit */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={isActive ? (image.alt ?? '') : ''}
                loading="lazy"
                className="size-full rounded-card border border-border bg-surface object-contain"
              />
            </button>
          );
        })}
      </div>

      {count > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            type="button"
            aria-label="Previous image"
            aria-controls={id}
            onClick={() => go(-1)}
            className="grid size-9 place-items-center rounded-full border border-border bg-surface text-muted transition-colors hover:text-foreground"
          >
            ←
          </button>
          <p id={id} aria-live="polite" className="min-w-16 text-center text-sm text-muted">
            {active + 1} / {count}
            <span className="sr-only">{images[active].alt ? `: ${images[active].alt}` : ''}</span>
          </p>
          <button
            type="button"
            aria-label="Next image"
            aria-controls={id}
            onClick={() => go(1)}
            className="grid size-9 place-items-center rounded-full border border-border bg-surface text-muted transition-colors hover:text-foreground"
          >
            →
          </button>
        </div>
      )}
      {hasCaptions && (
        // Below the arrows so they stay put as descriptions change length; the counter announces it
        <p aria-hidden className="mx-auto min-h-5 max-w-[70ch] text-center text-sm text-muted">
          {images[active].alt}
        </p>
      )}
      <MediaLightbox
        item={zoomed ? { url: images[active].url, alt: images[active].alt } : undefined}
        onClose={() => setZoomed(false)}
      />
    </section>
  );
}

'use client';

import { useState } from 'react';
import { MediaLightbox } from '@/components/MediaLightbox';

interface ZoomableImageProps {
  src: string;
  alt?: string;
  /** Classes for the image itself */
  className?: string;
  /** Classes for the button around it (block, size, alignment) */
  buttonClassName?: string;
  /** Show the alt text under the image as a caption (the full-size view always shows it) */
  caption?: boolean;
  /** Passed through as data-align, for the `.prose` alignment styles */
  align?: string;
  loading?: 'lazy' | 'eager';
}

/** An image that opens full size in a lightbox when clicked, optionally with its alt text below it. */
export function ZoomableImage({
  src,
  alt = '',
  className = '',
  buttonClassName = '',
  caption = false,
  align,
  loading,
}: ZoomableImageProps) {
  const [open, setOpen] = useState(false);
  const showCaption = caption && alt.length > 0;

  const image = (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label={`View full size${alt ? `: ${alt}` : ''}`}
      data-align={align}
      className={`zoomable-image block max-w-full cursor-zoom-in ${buttonClassName}`}
    >
      {/* Uploads or any http(s) host, so next/image's allow-list doesn't fit */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} data-align={align} loading={loading} className={className} />
    </button>
  );

  return (
    <>
      {showCaption ? (
        <figure data-align={align} className="zoomable-figure">
          {image}
          <figcaption className="mt-2 text-sm text-muted">{alt}</figcaption>
        </figure>
      ) : (
        image
      )}
      <MediaLightbox item={open ? { url: src, alt } : undefined} onClose={() => setOpen(false)} />
    </>
  );
}

'use client';

import { useEffect, useRef } from 'react';

interface ImageLightboxProps {
  /** The image to show; undefined keeps the viewer closed */
  image?: { url: string; alt?: string };
  onClose: () => void;
}

/** Full-screen image preview. Closes on Esc, the Close button, or a click anywhere. */
export function ImageLightbox({ image, onClose }: ImageLightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (image && !dialog.open) dialog.showModal();
    if (!image && dialog.open) dialog.close();
  }, [image]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={onClose}
      aria-label={image?.alt || 'Image preview'}
      className="m-auto max-h-none max-w-none cursor-zoom-out bg-transparent p-0 backdrop:bg-black/85"
    >
      {image && (
        <figure className="flex flex-col items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image.url} alt={image.alt ?? ''} className="max-h-[85vh] max-w-[94vw] rounded-md object-contain" />
          <figcaption className="flex items-center gap-4 text-sm text-white/85">
            {image.alt && <span>{image.alt}</span>}
            <button type="button" onClick={onClose} className="rounded-md border border-white/30 px-3 py-1 text-white hover:bg-white/10">
              Close
            </button>
          </figcaption>
        </figure>
      )}
    </dialog>
  );
}

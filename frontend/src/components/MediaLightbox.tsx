'use client';

import { useEffect, useRef } from 'react';

interface MediaLightboxProps {
  /** The image or video to show; undefined keeps the viewer closed */
  item?: { url: string; alt?: string; kind?: 'image' | 'video' };
  onClose: () => void;
}

/** Full-screen image or video preview. Closes on Esc, the Close button, or a click outside it. */
export function MediaLightbox({ item, onClose }: MediaLightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (item && !dialog.open) dialog.showModal();
    if (!item && dialog.open) dialog.close();
  }, [item]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      // Only the backdrop/empty space closes, so video controls stay usable
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      aria-label={item?.alt || (item?.kind === 'video' ? 'Video preview' : 'Image preview')}
      className="m-auto max-h-none max-w-none bg-transparent p-0 backdrop:bg-black/80"
    >
      {item && (
        <figure className="flex flex-col items-center gap-3">
          {item.kind === 'video' ? (
            <video
              src={item.url}
              controls
              autoPlay
              playsInline
              className="max-h-[85vh] max-w-[94vw] rounded-md bg-black"
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.url} alt={item.alt ?? ''} className="max-h-[85vh] max-w-[94vw] rounded-md object-contain" />
          )}
          <figcaption className="flex max-w-[94vw] items-center gap-4 text-sm text-white/85">
            {item.alt && <span className="max-w-[70ch]">{item.alt}</span>}
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-white/30 px-3 py-1 text-white hover:bg-white/10"
            >
              Close
            </button>
          </figcaption>
        </figure>
      )}
    </dialog>
  );
}

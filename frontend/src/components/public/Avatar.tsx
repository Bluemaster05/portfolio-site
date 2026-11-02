import type { CSSProperties } from 'react';
import type { AvatarCrop } from '@/lib/api/types';

export const DEFAULT_AVATAR_CROP: AvatarCrop = { x: 50, y: 50, zoom: 1 };

/**
 * CSS that shows the chosen part of an object-cover image: the focus point stays put (object
 * position) and the image zooms around it (transform origin).
 */
export function avatarCropStyle(crop: AvatarCrop = DEFAULT_AVATAR_CROP): CSSProperties {
  return {
    objectPosition: `${crop.x}% ${crop.y}%`,
    transform: `scale(${crop.zoom})`,
    transformOrigin: `${crop.x}% ${crop.y}%`,
  };
}

interface AvatarProps {
  src: string;
  alt: string;
  crop?: AvatarCrop;
  /** Size and any border/background; the avatar is always a circle */
  className: string;
}

/** A round avatar showing the part of the image picked in Site settings. */
export function Avatar({ src, alt, crop, className }: AvatarProps) {
  return (
    <span className={`relative block shrink-0 overflow-hidden rounded-full ${className}`}>
      {/* Uploads or any http(s) host, so next/image's allow-list doesn't fit */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} draggable={false} className="size-full object-cover" style={avatarCropStyle(crop)} />
    </span>
  );
}

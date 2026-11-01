'use client';

import { useEffect, useRef } from 'react';
import { firstFrame } from '@/lib/images';

interface LeadVideoProps {
  src: string;
  label: string;
  className?: string;
}

/**
 * The project's main video: plays muted on a loop as soon as it can, with controls to pause or
 * unmute. Visitors who ask for reduced motion get it paused on its first frame instead.
 */
export function LeadVideo({ src, label, className = '' }: LeadVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video && window.matchMedia('(prefers-reduced-motion: reduce)').matches) video.pause();
  }, []);

  return (
    <video
      ref={videoRef}
      src={firstFrame(src)}
      autoPlay
      muted
      loop
      playsInline
      controls
      preload="auto"
      aria-label={label}
      className={className}
    />
  );
}

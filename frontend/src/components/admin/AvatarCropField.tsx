'use client';

import { useRef, type KeyboardEvent, type PointerEvent } from 'react';
import type { AvatarCrop } from '@/lib/api/types';
import { Avatar, avatarCropStyle, DEFAULT_AVATAR_CROP } from '@/components/public/Avatar';
import { Button } from './ui';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const round = (value: number) => Math.round(value * 100) / 100;

interface AvatarCropFieldProps {
  src: string;
  value: AvatarCrop;
  onChange: (crop: AvatarCrop) => void;
}

/**
 * Pick the part of the avatar that shows in its circle. The image is drawn exactly as the site
 * draws it (same crop CSS), with everything outside the circle dimmed and the circle outlined.
 * Drag (or use the arrow keys) to move the image; the slider zooms.
 */
export function AvatarCropField({ src, value, onChange }: AvatarCropFieldProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number }>(undefined);

  function moveBy(dxPercent: number, dyPercent: number) {
    onChange({
      ...value,
      x: round(clamp(value.x + dxPercent, 0, 100)),
      y: round(clamp(value.y + dyPercent, 0, 100)),
    });
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { x: event.clientX, y: event.clientY };
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const start = drag.current;
    const size = frameRef.current?.clientWidth;
    if (!start || !size) return;
    // Dragging the image right shows more of its left side, so the focus point moves left
    const scale = 100 / size / value.zoom;
    moveBy(-(event.clientX - start.x) * scale, -(event.clientY - start.y) * scale);
    drag.current = { x: event.clientX, y: event.clientY };
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const step = event.shiftKey ? 10 : 2;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [step, 0],
      ArrowRight: [-step, 0],
      ArrowUp: [0, step],
      ArrowDown: [0, -step],
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    moveBy(...move);
  }

  return (
    <div className="flex flex-wrap items-start gap-6">
      <div className="grid gap-3">
        <div
          ref={frameRef}
          role="group"
          tabIndex={0}
          aria-label="Avatar position. Drag the photo, or use the arrow keys (Shift for bigger steps)."
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={() => (drag.current = undefined)}
          onPointerCancel={() => (drag.current = undefined)}
          onKeyDown={onKeyDown}
          className="relative size-60 cursor-grab touch-none select-none overflow-hidden rounded-card border border-border bg-surface active:cursor-grabbing"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" draggable={false} className="size-full object-cover" style={avatarCropStyle(value)} />
          {/* The avatar's circle: everything outside it is dimmed */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-full border-2 border-white shadow-[0_0_0_9999px_rgb(0_0_0/0.55)]"
          />
        </div>
        <label className="grid gap-1 text-sm">
          <span className="text-muted">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={value.zoom}
            onChange={(event) => onChange({ ...value, zoom: Number(event.target.value) })}
            className="w-60 accent-accent"
          />
        </label>
        <Button variant="ghost" className="justify-self-start px-0" onClick={() => onChange(DEFAULT_AVATAR_CROP)}>
          Reset
        </Button>
      </div>
      <div className="grid gap-2">
        <span className="text-sm text-muted">Preview</span>
        <div className="flex items-end gap-4">
          <Avatar src={src} alt="" crop={value} className="size-28 border border-border bg-surface" />
          <Avatar src={src} alt="" crop={value} className="size-10 border border-border bg-surface" />
        </div>
      </div>
    </div>
  );
}

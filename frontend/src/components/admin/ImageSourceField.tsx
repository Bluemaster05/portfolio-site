'use client';

import { useId, useRef, useState } from 'react';
import { IMAGE_ACCEPT, type UploadImage } from '@/lib/admin/media';
import { errorMessage } from '@/lib/admin/api-error';
import { isImageSrc, isUploadedImage } from '@/lib/images';
import { Button, TextInput } from './ui';

export type SourceMode = 'upload' | 'url';

interface ImageSourceFieldProps {
  /** Current image: '/media/<key>', an http(s) URL, or '' for none */
  value: string;
  onChange: (value: string) => void;
  onUpload: UploadImage;
  /** Accessible name, e.g. "Avatar" */
  label: string;
  /** Show a smaller preview, e.g. for icons */
  compact?: boolean;
}

/**
 * Pick an image by uploading a file (default) or pasting a URL. Either way the value is a URL
 * string, so fields that hold an image need no other changes to support both.
 */
export function ImageSourceField({ value, onChange, onUpload, label, compact = false }: ImageSourceFieldProps) {
  const [mode, setMode] = useState<SourceMode>(value && !isUploadedImage(value) ? 'url' : 'upload');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);
  const id = useId();

  async function upload(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError(undefined);
    try {
      onChange(await onUpload(file));
    } catch (uploadError) {
      setError(errorMessage(uploadError));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="grid gap-2">
      <SourceModeToggle label={label} mode={mode} onChange={setMode} />

      {mode === 'upload' ? (
        <div
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            void upload(event.dataTransfer.files[0]);
          }}
          className="flex flex-wrap items-center gap-3 rounded-md border border-dashed border-border bg-surface px-3 py-3"
        >
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept={IMAGE_ACCEPT}
            aria-label={`Upload ${label}`}
            onChange={(event) => void upload(event.target.files?.[0])}
            className="sr-only"
          />
          <Button onClick={() => inputRef.current?.click()} disabled={uploading}>
            {uploading ? 'Uploading…' : value ? 'Replace image' : 'Choose image'}
          </Button>
          <span className="text-sm text-muted">or drop a file here · PNG, JPEG, WebP, GIF, AVIF, SVG</span>
        </div>
      ) : (
        <TextInput
          type="url"
          aria-label={`${label} URL`}
          placeholder="https://…"
          value={isUploadedImage(value) ? '' : value}
          onChange={(event) => onChange(event.target.value.trim())}
        />
      )}

      {error && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}

      {isImageSrc(value) && (
        <div className="flex items-center gap-3">
          {/* Previews arbitrary hosts and uploads, so next/image's allow-list doesn't fit */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            className={`rounded-md border border-border bg-surface object-contain ${compact ? 'size-12 p-1' : 'max-h-40 max-w-full'}`}
          />
          <Button variant="ghost" onClick={() => onChange('')}>
            Remove
          </Button>
        </div>
      )}
    </div>
  );
}

/** Upload / URL switch shared by the image fields. */
export function SourceModeToggle({
  label,
  mode,
  onChange,
}: {
  label: string;
  mode: SourceMode;
  onChange: (mode: SourceMode) => void;
}) {
  return (
    <div role="radiogroup" aria-label={`${label} source`} className="inline-flex w-fit rounded-md border border-border p-0.5 text-sm">
      {(['upload', 'url'] as const).map((option) => (
        <button
          key={option}
          type="button"
          role="radio"
          aria-checked={mode === option}
          onClick={() => onChange(option)}
          className={`rounded px-2.5 py-1 ${mode === option ? 'bg-accent-soft font-medium text-foreground' : 'text-muted hover:text-foreground'}`}
        >
          {option === 'upload' ? 'Upload' : 'URL'}
        </button>
      ))}
    </div>
  );
}

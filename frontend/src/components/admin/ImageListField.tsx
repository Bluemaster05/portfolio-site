'use client';

import { useRef, useState } from 'react';
import { IMAGE_ACCEPT, type UploadMedia } from '@/lib/admin/media';
import { errorMessage } from '@/lib/admin/api-error';
import { isImageSrc } from '@/lib/images';
import type { ImageItem } from '@/lib/admin/form-values';
import { ImageLightbox } from './ImageLightbox';
import { SourceModeToggle, type SourceMode } from './MediaSourceField';
import { Button, TextInput } from './ui';

interface ImageListFieldProps {
  value: ImageItem[];
  onChange: (value: ImageItem[]) => void;
  onUpload: UploadMedia;
  label: string;
  /** Explains how the first image is used, e.g. "Main image" */
  firstLabel?: string;
  /** Most images allowed, e.g. 1 for a single header image */
  maxItems?: number;
}

/** An ordered list of images with alt text. Several files can be uploaded at once. */
export function ImageListField({
  value,
  onChange,
  onUpload,
  label,
  firstLabel = 'Main image',
  maxItems,
}: ImageListFieldProps) {
  const [mode, setMode] = useState<SourceMode>('upload');
  const [urlDraft, setUrlDraft] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>();
  const [previewIndex, setPreviewIndex] = useState<number>();
  const inputRef = useRef<HTMLInputElement>(null);
  const single = maxItems === 1;
  const remaining = maxItems === undefined ? Infinity : Math.max(0, maxItems - value.length);

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError(undefined);
    const added: ImageItem[] = [];
    try {
      // One at a time keeps the order the admin picked and stops at the first failure
      for (const file of Array.from(files).slice(0, remaining)) {
        added.push({ url: await onUpload(file), alt: '' });
      }
    } catch (uploadError) {
      setError(errorMessage(uploadError));
    } finally {
      if (added.length) onChange([...value, ...added]);
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function addUrl() {
    if (!isImageSrc(urlDraft) || remaining === 0) return;
    onChange([...value, { url: urlDraft, alt: '' }]);
    setUrlDraft('');
  }

  function update(index: number, patch: Partial<ImageItem>) {
    onChange(value.map((image, i) => (i === index ? { ...image, ...patch } : image)));
  }

  function move(from: number, to: number) {
    const next = [...value];
    const [image] = next.splice(from, 1);
    next.splice(to, 0, image);
    onChange(next);
  }

  return (
    <div className="grid gap-3">
      {value.length > 0 && (
        <ol className="grid gap-2">
          {value.map((image, index) => (
            <li
              key={`${image.url}-${index}`}
              className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-surface p-2"
            >
              <button
                type="button"
                onClick={() => setPreviewIndex(index)}
                aria-label={`View image ${index + 1} full screen`}
                className="cursor-zoom-in overflow-hidden rounded"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.url} alt="" className="h-16 w-24 object-cover transition-opacity hover:opacity-85" />
              </button>
              <div className="grid min-w-48 flex-1 gap-1">
                {index === 0 && !single && <span className="text-xs font-medium text-accent">{firstLabel}</span>}
                {maxItems !== undefined && index >= maxItems && (
                  <span className="text-xs font-medium text-red-700 dark:text-red-400">
                    Not shown in this layout; removed on save
                  </span>
                )}
                <TextInput
                  aria-label={`Description of image ${index + 1}`}
                  placeholder="Describe the image (alt text)"
                  value={image.alt ?? ''}
                  onChange={(event) => update(index, { alt: event.target.value })}
                />
              </div>
              <div className="flex gap-1">
                {index > 0 && !single && (
                  <Button variant="ghost" onClick={() => move(index, 0)}>
                    Make main
                  </Button>
                )}
                <Button
                  variant="ghost"
                  aria-label={`Move image ${index + 1} up`}
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                >
                  ↑
                </Button>
                <Button
                  variant="ghost"
                  aria-label={`Move image ${index + 1} down`}
                  disabled={index === value.length - 1}
                  onClick={() => move(index, index + 1)}
                >
                  ↓
                </Button>
                <Button variant="ghost" onClick={() => onChange(value.filter((_, i) => i !== index))}>
                  Remove
                </Button>
              </div>
            </li>
          ))}
        </ol>
      )}

      {remaining > 0 && (
        <div className="grid gap-2">
          <SourceModeToggle label={label} mode={mode} onChange={setMode} />
          {mode === 'upload' ? (
            <div
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                void uploadFiles(event.dataTransfer.files);
              }}
              className="flex flex-wrap items-center gap-3 rounded-md border border-dashed border-border bg-surface px-3 py-3"
            >
              <input
                ref={inputRef}
                type="file"
                multiple={!single}
                accept={IMAGE_ACCEPT}
                aria-label={`Upload ${label}`}
                onChange={(event) => void uploadFiles(event.target.files)}
                className="sr-only"
              />
              <Button onClick={() => inputRef.current?.click()} disabled={uploading}>
                {uploading ? 'Uploading…' : single ? 'Choose image' : 'Add images'}
              </Button>
              <span className="text-sm text-muted">
                {single ? 'or drop a file here' : 'or drop files here · you can pick several'}
              </span>
            </div>
          ) : (
            <div className="flex gap-2">
              <TextInput
                type="url"
                aria-label={`${label} URL`}
                placeholder="https://…"
                value={urlDraft}
                onChange={(event) => setUrlDraft(event.target.value.trim())}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    addUrl();
                  }
                }}
              />
              <Button onClick={addUrl} disabled={!isImageSrc(urlDraft)}>
                Add
              </Button>
            </div>
          )}
        </div>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}
      <ImageLightbox
        image={previewIndex === undefined ? undefined : value[previewIndex]}
        onClose={() => setPreviewIndex(undefined)}
      />
    </div>
  );
}

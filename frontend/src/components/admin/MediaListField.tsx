'use client';

import { useRef, useState } from 'react';
import { IMAGE_ACCEPT, VIDEO_ACCEPT, type UploadMedia } from '@/lib/admin/media';
import { errorMessage } from '@/lib/admin/api-error';
import { firstFrame, isImageSrc, isVideoSrc, looksLikeVideo, mainIndexOf } from '@/lib/images';
import type { MediaItem } from '@/lib/admin/form-values';
import { MediaLightbox } from '@/components/MediaLightbox';
import { SourceModeToggle, type SourceMode } from './MediaSourceField';
import { Button, TextInput } from './ui';

interface MediaListFieldProps {
  value: MediaItem[];
  onChange: (value: MediaItem[]) => void;
  onUpload: UploadMedia;
  label: string;
  /** Most items allowed, e.g. 1 for a single header */
  maxItems?: number;
  /** Images only: no videos and no main-item marking (e.g. extra images, a carousel) */
  imagesOnly?: boolean;
}

/**
 * One ordered list of images and videos with descriptions; the order is the gallery order.
 * Several files can be uploaded at once. One image is the main image (the cover on cards and the
 * home page) and one video the main video (leads the project page); unmarked, the first of each.
 */
export function MediaListField({ value, onChange, onUpload, label, maxItems, imagesOnly = false }: MediaListFieldProps) {
  const [mode, setMode] = useState<SourceMode>('upload');
  const [urlDraft, setUrlDraft] = useState('');
  const [urlKind, setUrlKind] = useState<MediaItem['kind']>('image');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>();
  const [previewIndex, setPreviewIndex] = useState<number>();
  const inputRef = useRef<HTMLInputElement>(null);
  const single = maxItems === 1;
  // Main images/videos only mean something for project media
  const showMain = !single && !imagesOnly;
  const remaining = maxItems === undefined ? Infinity : Math.max(0, maxItems - value.length);
  const urlValid = urlKind === 'video' ? isVideoSrc(urlDraft) : isImageSrc(urlDraft);
  const mainImageIndex = mainIndexOf(value, 'image');
  const mainVideoIndex = mainIndexOf(value, 'video');

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError(undefined);
    const added: MediaItem[] = [];
    try {
      // One at a time keeps the order the admin picked and stops at the first failure
      for (const file of Array.from(files).slice(0, remaining)) {
        if (imagesOnly && file.type.startsWith('video/')) {
          setError('Only images can be added here.');
          break;
        }
        const url = await onUpload(file);
        // The server names files by their detected type, so the extension is trustworthy
        added.push({ kind: looksLikeVideo(url) ? 'video' : 'image', url, alt: '' });
      }
    } catch (uploadError) {
      setError(errorMessage(uploadError));
    } finally {
      if (added.length) onChange([...value, ...added]);
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function changeUrlDraft(url: string) {
    setUrlDraft(url);
    if (url && !imagesOnly) setUrlKind(looksLikeVideo(url) ? 'video' : 'image');
  }

  function addUrl() {
    if (!urlValid || remaining === 0) return;
    onChange([...value, { kind: urlKind, url: urlDraft, alt: '' }]);
    setUrlDraft('');
  }

  function update(index: number, patch: Partial<MediaItem>) {
    onChange(value.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  /** Marks one item as the main of its kind and clears the mark on the others of that kind. */
  function makeMain(index: number) {
    const { kind } = value[index];
    onChange(value.map((item, i) => (item.kind === kind ? { ...item, main: i === index } : item)));
  }

  function move(from: number, to: number) {
    const next = [...value];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  return (
    <div className="grid gap-3">
      {value.length > 0 && (
        <ol className="grid gap-2">
          {value.map((item, index) => (
            <li
              key={`${item.url}-${index}`}
              className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-surface p-2"
            >
              <button
                type="button"
                onClick={() => setPreviewIndex(index)}
                aria-label={`View ${item.kind} ${index + 1} full screen`}
                className="relative cursor-zoom-in overflow-hidden rounded"
              >
                <MediaThumb item={item} />
              </button>
              <div className="grid min-w-48 flex-1 gap-1">
                <span className="text-xs font-medium text-muted">
                  {item.kind === 'video' ? 'Video' : 'Image'}
                  {showMain && index === (item.kind === 'video' ? mainVideoIndex : mainImageIndex) && (
                    <span className="text-accent">
                      {item.kind === 'video' ? ' · Main video (leads the page)' : ' · Main image (cover)'}
                    </span>
                  )}
                </span>
                {maxItems !== undefined && index >= maxItems && (
                  <span className="text-xs font-medium text-red-700 dark:text-red-400">
                    Not shown in this layout; removed on save
                  </span>
                )}
                <TextInput
                  aria-label={`Description of ${item.kind} ${index + 1}`}
                  placeholder={item.kind === 'video' ? 'Describe the video' : 'Describe the image (alt text)'}
                  value={item.alt ?? ''}
                  onChange={(event) => update(index, { alt: event.target.value })}
                />
              </div>
              <div className="flex gap-1">
                {showMain && index !== (item.kind === 'video' ? mainVideoIndex : mainImageIndex) && (
                  <Button variant="ghost" onClick={() => makeMain(index)}>
                    {item.kind === 'video' ? 'Make main video' : 'Make main image'}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  aria-label={`Move item ${index + 1} up`}
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                >
                  ↑
                </Button>
                <Button
                  variant="ghost"
                  aria-label={`Move item ${index + 1} down`}
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
                accept={imagesOnly ? IMAGE_ACCEPT : `${IMAGE_ACCEPT},${VIDEO_ACCEPT}`}
                aria-label={`Upload ${label}`}
                onChange={(event) => void uploadFiles(event.target.files)}
                className="sr-only"
              />
              <Button onClick={() => inputRef.current?.click()} disabled={uploading}>
                {uploading
                  ? 'Uploading…'
                  : imagesOnly
                    ? single
                      ? 'Choose image'
                      : 'Add images'
                    : single
                      ? 'Choose image or video'
                      : 'Add images or videos'}
              </Button>
              <span className="text-sm text-muted">
                {single ? 'or drop a file here' : 'or drop files here · you can pick several'}
                {!imagesOnly && ' · videos: MP4 or WebM'}
              </span>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {!imagesOnly && (
              <select
                aria-label="Kind of media at this URL"
                value={urlKind}
                onChange={(event) => setUrlKind(event.target.value === 'video' ? 'video' : 'image')}
                className="rounded-md border border-border bg-surface px-2 py-2 text-sm"
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
              )}
              <TextInput
                type="url"
                aria-label={`${label} URL`}
                placeholder="https://…"
                value={urlDraft}
                onChange={(event) => changeUrlDraft(event.target.value.trim())}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    addUrl();
                  }
                }}
                className="min-w-60 flex-1"
              />
              <Button onClick={addUrl} disabled={!urlValid}>
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
      <MediaLightbox
        item={previewIndex === undefined ? undefined : value[previewIndex]}
        onClose={() => setPreviewIndex(undefined)}
      />
    </div>
  );
}

/** Small preview: the image, or a video's first frame with a play badge. */
function MediaThumb({ item }: { item: MediaItem }) {
  if (item.kind === 'video') {
    return (
      <>
        <video
          src={firstFrame(item.url)}
          preload="metadata"
          muted
          playsInline
          className="h-16 w-24 bg-black object-cover transition-opacity hover:opacity-85"
        />
        <span aria-hidden className="absolute inset-0 grid place-items-center">
          <span className="grid size-6 place-items-center rounded-full bg-black/70 pl-0.5 text-[0.65rem] text-white">
            ▶
          </span>
        </span>
      </>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={item.url} alt="" className="h-16 w-24 object-cover transition-opacity hover:opacity-85" />;
}

import {
  BadRequestException,
  Injectable,
  NotFoundException,
  PayloadTooLargeException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { randomUUID } from 'node:crypto';
import { copyFile, mkdir, open, rename, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { MediaAsset } from './entities/media-asset.entity.js';
import { MediaAssetResponseDto } from './dto/media-asset.dto.js';
import { detectMediaType, MEDIA_TYPES_BY_EXTENSION } from './media-type.js';

/** Public URL segment for an uploaded file; the frontend proxies /media/* to /api/media/*. */
export const MEDIA_URL_PREFIX = '/media/';

/** `<uuid>.<ext>` — anything else is never a stored file, so it can't escape UPLOAD_DIR. */
const KEY_PATTERN = new RegExp(`^[0-9a-f-]{36}\\.(${Object.keys(MEDIA_TYPES_BY_EXTENSION).join('|')})$`);

/** Video signatures sit at the start of the file; images are read whole (SVG needs every byte). */
const VIDEO_SNIFF_BYTES = 64 * 1024;

const MB = 1024 * 1024;

export function maxImageBytes(): number {
  return Number(process.env.MAX_UPLOAD_MB ?? 5) * MB;
}

export function maxVideoBytes(): number {
  return Number(process.env.MAX_VIDEO_UPLOAD_MB ?? 100) * MB;
}

/** The hard cap multer enforces; the per-kind limit is checked after the type is known. */
export function maxUploadBytes(): number {
  return Math.max(maxImageBytes(), maxVideoBytes());
}

@Injectable()
export class MediaService {
  private readonly uploadDir = resolve(process.env.UPLOAD_DIR ?? 'uploads');

  constructor(private readonly em: EntityManager) {}

  /** Stores a file multer wrote to a temporary path; the temporary file is always removed. */
  async upload(file: Express.Multer.File): Promise<MediaAssetResponseDto> {
    try {
      const head = await readHead(file.path, file.size <= maxImageBytes() ? file.size : VIDEO_SNIFF_BYTES);
      const type = detectMediaType(head);
      if (!type) {
        throw new BadRequestException(
          'Upload a PNG, JPEG, GIF, WebP, AVIF, or SVG (without scripts) image, or an MP4 or WebM video',
        );
      }
      if (type.kind === 'image' && file.size > maxImageBytes()) {
        throw new PayloadTooLargeException(`Images can be at most ${maxImageBytes() / MB} MB`);
      }

      const key = `${randomUUID()}.${type.extension}`;
      await mkdir(this.uploadDir, { recursive: true });
      await moveFile(file.path, resolve(this.uploadDir, key));

      const asset = this.em.create(MediaAsset, {
        key,
        originalName: file.originalname.slice(0, 255),
        mimeType: type.mimeType,
        size: file.size,
      });
      await this.em.flush();
      return toResponse(asset);
    } finally {
      await rm(file.path, { force: true });
    }
  }

  async findAll(): Promise<MediaAssetResponseDto[]> {
    const assets = await this.em.find(MediaAsset, {}, { orderBy: { createdAt: 'desc' } });
    return assets.map(toResponse);
  }

  async remove(id: number): Promise<void> {
    const asset = await this.em.findOne(MediaAsset, id);
    if (!asset) throw new NotFoundException('Media not found');
    await rm(resolve(this.uploadDir, asset.key), { force: true });
    await this.em.remove(asset).flush();
  }

  /** Absolute path and MIME type for a stored file, or undefined for unknown keys. */
  resolveFile(key: string): { path: string; mimeType: string } | undefined {
    if (!KEY_PATTERN.test(key)) return undefined;
    const extension = key.slice(key.lastIndexOf('.') + 1);
    return { path: resolve(this.uploadDir, key), mimeType: MEDIA_TYPES_BY_EXTENSION[extension] };
  }
}

async function readHead(path: string, bytes: number): Promise<Buffer> {
  const handle = await open(path, 'r');
  try {
    const buffer = Buffer.alloc(bytes);
    const { bytesRead } = await handle.read(buffer, 0, bytes, 0);
    return buffer.subarray(0, bytesRead);
  } finally {
    await handle.close();
  }
}

/** rename, falling back to copy when the temp dir is on another drive. */
async function moveFile(from: string, to: string): Promise<void> {
  try {
    await rename(from, to);
  } catch (error) {
    if (!(error instanceof Error && 'code' in error && error.code === 'EXDEV')) throw error;
    await copyFile(from, to);
  }
}

function toResponse(asset: MediaAsset): MediaAssetResponseDto {
  return {
    id: asset.id,
    key: asset.key,
    url: `${MEDIA_URL_PREFIX}${asset.key}`,
    originalName: asset.originalName,
    mimeType: asset.mimeType,
    size: asset.size,
    createdAt: asset.createdAt,
  };
}

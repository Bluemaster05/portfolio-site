import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { randomUUID } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { MediaAsset } from './entities/media-asset.entity.js';
import { MediaAssetResponseDto } from './dto/media-asset.dto.js';
import { detectImageType, IMAGE_TYPES_BY_EXTENSION } from './image-type.js';

/** Public URL segment for an uploaded file; the frontend proxies /media/* to /api/media/*. */
export const MEDIA_URL_PREFIX = '/media/';

/** `<uuid>.<ext>` — anything else is never a stored file, so it can't escape UPLOAD_DIR. */
const KEY_PATTERN = new RegExp(`^[0-9a-f-]{36}\\.(${Object.keys(IMAGE_TYPES_BY_EXTENSION).join('|')})$`);

export function maxUploadBytes(): number {
  return Number(process.env.MAX_UPLOAD_MB ?? 5) * 1024 * 1024;
}

@Injectable()
export class MediaService {
  private readonly uploadDir = resolve(process.env.UPLOAD_DIR ?? 'uploads');

  constructor(private readonly em: EntityManager) {}

  async upload(file: Express.Multer.File): Promise<MediaAssetResponseDto> {
    const type = detectImageType(file.buffer);
    if (!type) {
      throw new BadRequestException('Only PNG, JPEG, GIF, WebP, AVIF, or SVG (without scripts) images can be uploaded');
    }

    const key = `${randomUUID()}.${type.extension}`;
    await mkdir(this.uploadDir, { recursive: true });
    await writeFile(resolve(this.uploadDir, key), file.buffer);

    const asset = this.em.create(MediaAsset, {
      key,
      originalName: file.originalname.slice(0, 255),
      mimeType: type.mimeType,
      size: file.size,
    });
    await this.em.flush();
    return toResponse(asset);
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
    return { path: resolve(this.uploadDir, key), mimeType: IMAGE_TYPES_BY_EXTENSION[extension] };
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

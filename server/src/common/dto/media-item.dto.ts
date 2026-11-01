import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { IsMediaSourceFor } from '../validators/is-media-source.js';

export const MEDIA_KINDS = ['image', 'video'] as const;
export type MediaKind = (typeof MEDIA_KINDS)[number];

/** One image or video in an ordered list, with its description for screen readers. */
export class MediaItemDto {
  @ApiProperty({ enum: MEDIA_KINDS, enumName: 'MediaKind' })
  @IsIn(MEDIA_KINDS)
  kind!: MediaKind;

  /** Upload (`/media/<key>`, matching `kind`) or an http(s) URL */
  @IsMediaSourceFor('kind')
  @MaxLength(2048)
  url!: string;

  /** Alternative text for an image, or a short description of a video */
  @IsOptional()
  @IsString()
  @MaxLength(300)
  alt?: string;
}

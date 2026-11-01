import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString, MaxLength, registerDecorator } from 'class-validator';
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

  /**
   * The main item of its kind: the main image is the cover on cards and the home page; the main
   * video leads the project page. Without one, the first item of that kind is used.
   */
  @IsOptional()
  @IsBoolean()
  main?: boolean;
}

/** A media list may mark at most one main image and one main video. */
export function HasOneMainPerKind(): PropertyDecorator {
  return (object, propertyName) => {
    registerDecorator({
      name: 'hasOneMainPerKind',
      target: object.constructor,
      propertyName: String(propertyName),
      options: { message: '$property may mark at most one main image and one main video' },
      validator: {
        validate: (value: unknown) => {
          if (!Array.isArray(value)) return true;
          return MEDIA_KINDS.every(
            (kind) => value.filter((item: Partial<MediaItemDto>) => item?.kind === kind && item.main).length <= 1,
          );
        },
      },
    });
  };
}

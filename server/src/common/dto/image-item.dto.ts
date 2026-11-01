import { IsOptional, IsString, MaxLength } from 'class-validator';
import { IsImageSource } from '../validators/is-media-source.js';

/** One image in an ordered list (no videos), with its description for screen readers. */
export class ImageItemDto {
  /** Upload (`/media/<key>`) or an http(s) image URL */
  @IsImageSource()
  @MaxLength(2048)
  url!: string;

  /** Alternative text for the image */
  @IsOptional()
  @IsString()
  @MaxLength(300)
  alt?: string;
}

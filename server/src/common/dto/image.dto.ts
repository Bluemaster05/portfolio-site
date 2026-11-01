import { IsOptional, IsString, MaxLength } from 'class-validator';
import { IsImageSource } from '../validators/is-image-source.js';

/** An image reference with its description for screen readers. */
export class ImageDto {
  /** Uploaded image (`/media/<key>`) or an http(s) URL */
  @IsImageSource()
  @MaxLength(2048)
  url!: string;

  /** Alternative text; describe what the image shows */
  @IsOptional()
  @IsString()
  @MaxLength(300)
  alt?: string;
}

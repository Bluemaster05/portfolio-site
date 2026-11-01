import { applyDecorators } from '@nestjs/common';
import { Matches } from 'class-validator';

/** An uploaded image (`/media/<key>`) or an absolute http(s) image URL. */
export const IMAGE_SOURCE_PATTERN = /^(https?:\/\/\S+|\/media\/[A-Za-z0-9._-]+)$/i;

export const IsImageSource = () =>
  applyDecorators(
    Matches(IMAGE_SOURCE_PATTERN, {
      message: '$property must be an uploaded image (/media/…) or an http(s) URL',
    }),
  );

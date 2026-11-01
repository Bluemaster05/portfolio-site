import { applyDecorators } from '@nestjs/common';
import { Matches } from 'class-validator';
import { IMAGE_EXTENSIONS, VIDEO_EXTENSIONS } from '../../media/media-type.js';

const uploaded = (extensions: string[]) => `\\/media\\/[A-Za-z0-9_-]+\\.(${extensions.join('|')})`;

/** An uploaded image (`/media/<key>.<image ext>`) or an absolute http(s) image URL. */
export const IMAGE_SOURCE_PATTERN = new RegExp(`^(https?:\\/\\/\\S+|${uploaded(IMAGE_EXTENSIONS)})$`, 'i');

/** An uploaded video (`/media/<key>.mp4|webm`) or an absolute http(s) URL of a video file. */
export const VIDEO_SOURCE_PATTERN = new RegExp(`^(https?:\\/\\/\\S+|${uploaded(VIDEO_EXTENSIONS)})$`, 'i');

export const IsImageSource = () =>
  applyDecorators(
    Matches(IMAGE_SOURCE_PATTERN, {
      message: '$property must be an uploaded image (/media/…) or an http(s) URL',
    }),
  );

export const IsVideoSource = () =>
  applyDecorators(
    Matches(VIDEO_SOURCE_PATTERN, {
      message: '$property must be an uploaded MP4/WebM video (/media/…) or an http(s) URL',
    }),
  );

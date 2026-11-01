import { applyDecorators } from '@nestjs/common';
import { Matches, registerDecorator, type ValidationArguments } from 'class-validator';
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

/**
 * A media URL whose kind is given by a sibling property (`'image'` or `'video'`): uploads must be
 * of that kind; http(s) URLs are accepted for either.
 */
export function IsMediaSourceFor(kindProperty: string): PropertyDecorator {
  return (object, propertyName) => {
    registerDecorator({
      name: 'isMediaSourceFor',
      target: object.constructor,
      propertyName: String(propertyName),
      constraints: [kindProperty],
      options: {
        message: (args: ValidationArguments) =>
          `${args.property} must be an uploaded ${kindOf(args) === 'video' ? 'MP4/WebM video' : 'image'} (/media/…) or an http(s) URL`,
      },
      validator: {
        validate: (value: unknown, args: ValidationArguments) => {
          if (typeof value !== 'string') return false;
          return (kindOf(args) === 'video' ? VIDEO_SOURCE_PATTERN : IMAGE_SOURCE_PATTERN).test(value);
        },
      },
    });
  };
}

function kindOf(args: ValidationArguments): unknown {
  const [kindProperty] = args.constraints as [string];
  return (args.object as Record<string, unknown>)[kindProperty];
}

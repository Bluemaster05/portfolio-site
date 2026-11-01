import { applyDecorators } from '@nestjs/common';
import { Matches } from 'class-validator';

/** An absolute http(s) URL or a mailto: link — never javascript: or data: URLs. */
export const IsSafeUrl = () =>
  applyDecorators(
    Matches(/^(https?:\/\/[^\s]+|mailto:[^\s]+)$/i, {
      message: '$property must be an http(s) or mailto URL',
    }),
  );

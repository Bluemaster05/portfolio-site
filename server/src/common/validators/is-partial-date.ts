import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';

export const PARTIAL_DATE_PATTERN = /^\d{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?)?$/;

/**
 * A date with optional precision: `YYYY`, `YYYY-MM` or `YYYY-MM-DD`.
 * Portfolio dates are usually month precision, and strings avoid time zone shifts.
 */
export const IsPartialDate = (description: string, required = true) =>
  applyDecorators(
    ApiProperty({ description, required, example: '2024-06', pattern: PARTIAL_DATE_PATTERN.source }),
    Matches(PARTIAL_DATE_PATTERN, {
      message: '$property must look like YYYY, YYYY-MM or YYYY-MM-DD',
    }),
  );

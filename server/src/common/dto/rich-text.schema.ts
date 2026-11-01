import type { ApiPropertyOptions } from '@nestjs/swagger';

/** Swagger schema for a TipTap JSON document in response DTOs. */
export const richTextSchema = (description: string): ApiPropertyOptions => ({
  description,
  type: Object,
  additionalProperties: true,
});

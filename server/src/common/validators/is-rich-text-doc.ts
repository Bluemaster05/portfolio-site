import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { registerDecorator } from 'class-validator';
import { isRichTextDoc, MAX_RICH_TEXT_BYTES } from '../types/rich-text.js';

function IsRichTextDocConstraint(): PropertyDecorator {
  return (object, propertyName) => {
    registerDecorator({
      name: 'isRichTextDoc',
      target: object.constructor,
      propertyName: String(propertyName),
      options: {
        message: `$property must be a TipTap document ({ "type": "doc" }) under ${MAX_RICH_TEXT_BYTES / 1024} KB`,
      },
      validator: { validate: (value: unknown) => isRichTextDoc(value) },
    });
  };
}

/** A TipTap JSON document. See docs/RichContent.md. */
export const IsRichTextDoc = (
  description = 'Rich text as a TipTap JSON document',
  required = true,
) =>
  applyDecorators(
    ApiProperty({
      description,
      required,
      type: Object,
      additionalProperties: true,
      example: {
        type: 'doc',
        content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] }],
      },
    }),
    IsRichTextDocConstraint(),
  );

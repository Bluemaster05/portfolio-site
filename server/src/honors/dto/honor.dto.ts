import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, Length, MaxLength } from 'class-validator';
import { ContentItemFieldsDto, ContentItemResponseDto } from '../../common/dto/content-item.dto.js';
import { richTextSchema } from '../../common/dto/rich-text.schema.js';
import { IsPartialDate } from '../../common/validators/is-partial-date.js';
import { IsRichTextDoc } from '../../common/validators/is-rich-text-doc.js';
import { IsSafeUrl } from '../../common/validators/is-safe-url.js';
import type { RichTextDoc } from '../../common/types/rich-text.js';

export class CreateHonorDto extends ContentItemFieldsDto {
  @IsString()
  @Length(1, 200)
  title!: string;

  /** Who awarded it */
  @IsOptional()
  @IsString()
  @MaxLength(200)
  issuer?: string;

  @IsOptional()
  @IsPartialDate('When it was awarded', false)
  date?: string;

  /** Link to a certificate or announcement */
  @IsOptional()
  @IsSafeUrl()
  @MaxLength(2048)
  url?: string;

  @IsOptional()
  @IsRichTextDoc('What it was for', false)
  description?: RichTextDoc;
}

export class UpdateHonorDto extends PartialType(CreateHonorDto) {}

export class HonorResponseDto extends ContentItemResponseDto {
  title!: string;
  issuer?: string;
  date?: string;
  url?: string;

  @ApiProperty(richTextSchema('What it was for'))
  description!: RichTextDoc;
}

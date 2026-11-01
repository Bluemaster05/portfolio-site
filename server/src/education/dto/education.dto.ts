import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, Length, MaxLength } from 'class-validator';
import { ContentItemFieldsDto, ContentItemResponseDto } from '../../common/dto/content-item.dto.js';
import { richTextSchema } from '../../common/dto/rich-text.schema.js';
import { IsPartialDate } from '../../common/validators/is-partial-date.js';
import { IsRichTextDoc } from '../../common/validators/is-rich-text-doc.js';
import { IsSafeUrl } from '../../common/validators/is-safe-url.js';
import type { RichTextDoc } from '../../common/types/rich-text.js';
import { EmptyToNull } from '../../common/validators/empty-to-null.js';

export class CreateEducationDto extends ContentItemFieldsDto {
  @IsString()
  @Length(1, 200)
  institution!: string;

  /** e.g. "B.S. Computer Science" */
  @IsString()
  @Length(1, 200)
  degree!: string;

  /** e.g. "Minor in Mathematics" */
  @IsOptional()
  @EmptyToNull()
  @IsString()
  @MaxLength(200)
  fieldOfStudy?: string;

  @IsOptional()
  @EmptyToNull()
  @IsString()
  @MaxLength(120)
  location?: string;

  @IsOptional()
  @EmptyToNull()
  @IsSafeUrl()
  @MaxLength(2048)
  url?: string;

  @IsOptional()
  @EmptyToNull()
  @IsPartialDate('When study started', false)
  startDate?: string;

  @IsOptional()
  @EmptyToNull()
  @IsPartialDate('Expected or actual graduation', false)
  endDate?: string;

  /** e.g. "3.9 GPA", "First Class Honours" */
  @IsOptional()
  @EmptyToNull()
  @IsString()
  @MaxLength(100)
  grade?: string;

  @IsOptional()
  @IsRichTextDoc('Coursework, activities, thesis, …', false)
  description?: RichTextDoc;
}

export class UpdateEducationDto extends PartialType(CreateEducationDto) {}

export class EducationResponseDto extends ContentItemResponseDto {
  institution!: string;
  degree!: string;
  fieldOfStudy?: string;
  location?: string;
  url?: string;
  startDate?: string;
  endDate?: string;
  grade?: string;

  @ApiProperty(richTextSchema('Coursework, activities, thesis, …'))
  description!: RichTextDoc;
}

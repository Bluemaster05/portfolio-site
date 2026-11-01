import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Length, Matches, MaxLength } from 'class-validator';
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

  /** URL segment for /education/[slug]; empty to generate from the degree and institution */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  @Matches(/^([a-z0-9]+(-[a-z0-9]+)*)?$/, { message: 'slug may only contain a-z, 0-9 and single dashes' })
  slug?: string;

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
  @IsRichTextDoc('Short summary: coursework, activities, thesis, …', false)
  description?: RichTextDoc;

  @IsOptional()
  @IsRichTextDoc('Longer write-up, shown only on the entry’s own page', false)
  writeup?: RichTextDoc;

  /** Show on the home page; featuring this entry unfeatures any other */
  @IsOptional()
  @IsBoolean()
  featured?: boolean;
}

export class UpdateEducationDto extends PartialType(CreateEducationDto) {}

/** An education entry without its write-up, for lists. */
export class EducationSummaryDto extends ContentItemResponseDto {
  institution!: string;
  degree!: string;
  slug!: string;
  fieldOfStudy?: string;
  location?: string;
  url?: string;
  startDate?: string;
  endDate?: string;
  grade?: string;
  /** Shown on the home page (at most one entry) */
  featured!: boolean;

  @ApiProperty(richTextSchema('Short summary: coursework, activities, thesis, …'))
  description!: RichTextDoc;
}

export class EducationResponseDto extends EducationSummaryDto {
  @ApiProperty(richTextSchema('Longer write-up, shown only on the entry’s own page'))
  writeup!: RichTextDoc;
}

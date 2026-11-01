import { ApiProperty, PartialType } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsOptional, IsString, Length, MaxLength } from 'class-validator';
import { ContentItemFieldsDto, ContentItemResponseDto } from '../../common/dto/content-item.dto.js';
import { richTextSchema } from '../../common/dto/rich-text.schema.js';
import { IsPartialDate } from '../../common/validators/is-partial-date.js';
import { IsRichTextDoc } from '../../common/validators/is-rich-text-doc.js';
import { IsSafeUrl } from '../../common/validators/is-safe-url.js';
import type { RichTextDoc } from '../../common/types/rich-text.js';
import { EmptyToNull } from '../../common/validators/empty-to-null.js';

export class CreateExperienceDto extends ContentItemFieldsDto {
  /** Company or organization */
  @IsString()
  @Length(1, 200)
  organization!: string;

  /** Job title */
  @IsString()
  @Length(1, 200)
  role!: string;

  /** e.g. "Full-time", "Internship", "Contract" */
  @IsOptional()
  @EmptyToNull()
  @IsString()
  @MaxLength(60)
  employmentType?: string;

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

  @IsPartialDate('When the role started')
  startDate!: string;

  @IsOptional()
  @EmptyToNull()
  @IsPartialDate('When the role ended; empty while current', false)
  endDate?: string;

  @IsOptional()
  @IsRichTextDoc('What the role involved', false)
  description?: RichTextDoc;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  skills?: string[];
}

export class UpdateExperienceDto extends PartialType(CreateExperienceDto) {}

export class ExperienceResponseDto extends ContentItemResponseDto {
  organization!: string;
  role!: string;
  employmentType?: string;
  location?: string;
  url?: string;
  startDate!: string;
  endDate?: string;

  @ApiProperty(richTextSchema('What the role involved'))
  description!: RichTextDoc;

  skills!: string[];
}

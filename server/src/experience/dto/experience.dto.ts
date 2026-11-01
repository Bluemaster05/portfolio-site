import { ApiProperty, PartialType } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsBoolean, IsInt, IsOptional, IsString, Length, Matches, MaxLength } from 'class-validator';
import { ContentItemFieldsDto, ContentItemResponseDto } from '../../common/dto/content-item.dto.js';
import { richTextSchema } from '../../common/dto/rich-text.schema.js';
import { IsPartialDate } from '../../common/validators/is-partial-date.js';
import { IsRichTextDoc } from '../../common/validators/is-rich-text-doc.js';
import type { RichTextDoc } from '../../common/types/rich-text.js';
import { EmptyToNull } from '../../common/validators/empty-to-null.js';
import { TechnologySummaryDto } from '../../technologies/dto/technology.dto.js';
import { EmployerSummaryDto } from './employer.dto.js';

export class CreateExperienceDto extends ContentItemFieldsDto {
  /** The employer this job was at */
  @IsInt()
  employerId!: number;

  /** Job title */
  @IsString()
  @Length(1, 200)
  role!: string;

  /** URL segment for /experience/[slug]; empty to generate from the role and employer */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  @Matches(/^([a-z0-9]+(-[a-z0-9]+)*)?$/, { message: 'slug may only contain a-z, 0-9 and single dashes' })
  slug?: string;

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

  @IsPartialDate('When the role started')
  startDate!: string;

  @IsOptional()
  @EmptyToNull()
  @IsPartialDate('When the role ended; empty while current', false)
  endDate?: string;

  @IsOptional()
  @IsRichTextDoc('Short summary of the role, shown in the list and on its page', false)
  description?: RichTextDoc;

  @IsOptional()
  @IsRichTextDoc('Longer write-up, shown only on the job’s own page', false)
  writeup?: RichTextDoc;

  /** Free-text skills, e.g. "Leadership" */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  skills?: string[];

  /** Technology ids, in display order */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsInt({ each: true })
  technologyIds?: number[];

  /** Show on the home page; featuring this job unfeatures any other */
  @IsOptional()
  @IsBoolean()
  featured?: boolean;
}

export class UpdateExperienceDto extends PartialType(CreateExperienceDto) {}

/** A job without its write-up, for lists. */
export class ExperienceSummaryDto extends ContentItemResponseDto {
  employer!: EmployerSummaryDto;
  role!: string;
  slug!: string;
  employmentType?: string;
  location?: string;
  startDate!: string;
  endDate?: string;

  @ApiProperty(richTextSchema('Short summary of the role'))
  description!: RichTextDoc;

  skills!: string[];
  technologies!: TechnologySummaryDto[];
  /** Shown on the home page (at most one job) */
  featured!: boolean;
}

export class ExperienceResponseDto extends ExperienceSummaryDto {
  @ApiProperty(richTextSchema('Longer write-up, shown only on the job’s own page'))
  writeup!: RichTextDoc;
}

/** An employer with its published jobs, for the public experience page. */
export class ExperienceGroupDto {
  employer!: EmployerSummaryDto;
  /** Newest first (after any manual order) */
  jobs!: ExperienceSummaryDto[];
}

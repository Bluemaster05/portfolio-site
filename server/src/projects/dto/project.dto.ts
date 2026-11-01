import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { HasOneMainPerKind, MediaItemDto } from '../../common/dto/media-item.dto.js';
import { ProjectMediaLayout } from '../entities/project.entity.js';
import { ContentItemFieldsDto, ContentItemResponseDto } from '../../common/dto/content-item.dto.js';
import { richTextSchema } from '../../common/dto/rich-text.schema.js';
import { IsPartialDate } from '../../common/validators/is-partial-date.js';
import { IsRichTextDoc } from '../../common/validators/is-rich-text-doc.js';
import { IsSafeUrl } from '../../common/validators/is-safe-url.js';
import type { RichTextDoc } from '../../common/types/rich-text.js';
import { EmptyToNull } from '../../common/validators/empty-to-null.js';

export class CreateProjectDto extends ContentItemFieldsDto {
  @IsString()
  @Length(1, 200)
  title!: string;

  /** URL segment; generated from the title when omitted */
  @IsOptional()
  @EmptyToNull()
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, { message: 'slug may only contain a-z, 0-9 and dashes' })
  @MaxLength(120)
  slug?: string;

  /** Short plain-text summary for cards and meta descriptions */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  summary?: string;

  @IsOptional()
  @IsRichTextDoc('Project write-up', false)
  content?: RichTextDoc;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  technologies?: string[];

  @IsOptional()
  @EmptyToNull()
  @IsSafeUrl()
  @MaxLength(2048)
  repoUrl?: string;

  @IsOptional()
  @EmptyToNull()
  @IsSafeUrl()
  @MaxLength(2048)
  liveUrl?: string;

  @ApiProperty({ enum: ProjectMediaLayout, enumName: 'ProjectMediaLayout', required: false })
  @IsOptional()
  @IsEnum(ProjectMediaLayout)
  mediaLayout?: ProjectMediaLayout;

  /**
   * Images and videos in gallery order (single layout shows only the first). The main video, else
   * the main image, leads the project page; cards and the home page use the main image.
   */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @HasOneMainPerKind()
  @ValidateNested({ each: true })
  @Type(() => MediaItemDto)
  media?: MediaItemDto[];

  @IsOptional()
  @EmptyToNull()
  @IsPartialDate('When work started', false)
  startDate?: string;

  @IsOptional()
  @EmptyToNull()
  @IsPartialDate('When work finished; empty if ongoing', false)
  endDate?: string;

  /** Shown on the home page */
  @IsOptional()
  @IsBoolean()
  featured?: boolean;
}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}

export class ProjectResponseDto extends ContentItemResponseDto {
  title!: string;
  slug!: string;
  summary!: string;

  @ApiProperty(richTextSchema('Project write-up'))
  content!: RichTextDoc;

  technologies!: string[];
  repoUrl?: string;
  liveUrl?: string;

  @ApiProperty({ enum: ProjectMediaLayout, enumName: 'ProjectMediaLayout' })
  mediaLayout!: ProjectMediaLayout;

  /** Images and videos in gallery order; see `main` on each item */
  media!: MediaItemDto[];
  startDate?: string;
  endDate?: string;
  featured!: boolean;
}

/** A project without its write-up, for lists */
export class ProjectSummaryDto extends OmitType(ProjectResponseDto, ['content']) {}

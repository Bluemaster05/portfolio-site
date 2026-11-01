import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsBoolean, IsOptional, IsString, Length, Matches, MaxLength, ValidateNested } from 'class-validator';
import { ImageItemDto } from '../../common/dto/image-item.dto.js';
import { ContentItemFieldsDto, ContentItemResponseDto } from '../../common/dto/content-item.dto.js';
import { richTextSchema } from '../../common/dto/rich-text.schema.js';
import { IsPartialDate } from '../../common/validators/is-partial-date.js';
import { IsRichTextDoc } from '../../common/validators/is-rich-text-doc.js';
import { IsSafeUrl } from '../../common/validators/is-safe-url.js';
import { IsImageSource } from '../../common/validators/is-media-source.js';
import type { RichTextDoc } from '../../common/types/rich-text.js';
import { EmptyToNull } from '../../common/validators/empty-to-null.js';

export class CreateHonorDto extends ContentItemFieldsDto {
  @IsString()
  @Length(1, 200)
  title!: string;

  /** URL segment for /honors/[slug]; empty to generate from the title and issuer */
  @IsOptional()
  @IsString()
  @MaxLength(120)
  @Matches(/^([a-z0-9]+(-[a-z0-9]+)*)?$/, { message: 'slug may only contain a-z, 0-9 and single dashes' })
  slug?: string;

  /** Who awarded it */
  @IsOptional()
  @EmptyToNull()
  @IsString()
  @MaxLength(200)
  issuer?: string;

  @IsOptional()
  @EmptyToNull()
  @IsPartialDate('When it was awarded', false)
  date?: string;

  /** Link to a certificate or announcement */
  @IsOptional()
  @EmptyToNull()
  @IsSafeUrl()
  @MaxLength(2048)
  url?: string;

  /** Main image (e.g. the award or certificate): an upload or an http(s) image URL */
  @IsOptional()
  @EmptyToNull()
  @IsImageSource()
  @MaxLength(2048)
  imageUrl?: string;

  /** Describes the main image for screen readers; the title is used when empty */
  @IsOptional()
  @EmptyToNull()
  @IsString()
  @MaxLength(300)
  imageAlt?: string;

  /** More images, in carousel order, shown on the honor's page */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => ImageItemDto)
  images?: ImageItemDto[];

  @IsOptional()
  @IsRichTextDoc('Short summary of what it was for', false)
  description?: RichTextDoc;

  @IsOptional()
  @IsRichTextDoc('Longer write-up, shown only on the honor’s own page', false)
  writeup?: RichTextDoc;

  /** Show on the home page; featuring this honor unfeatures any other */
  @IsOptional()
  @IsBoolean()
  featured?: boolean;
}

export class UpdateHonorDto extends PartialType(CreateHonorDto) {}

/** An honor without its write-up, for lists. */
export class HonorSummaryDto extends ContentItemResponseDto {
  title!: string;
  slug!: string;
  issuer?: string;
  date?: string;
  url?: string;
  imageUrl?: string;
  imageAlt?: string;
  /** More images, in carousel order */
  images!: ImageItemDto[];
  /** Shown on the home page (at most one honor) */
  featured!: boolean;

  @ApiProperty(richTextSchema('Short summary of what it was for'))
  description!: RichTextDoc;
}

export class HonorResponseDto extends HonorSummaryDto {
  @ApiProperty(richTextSchema('Longer write-up, shown only on the honor’s own page'))
  writeup!: RichTextDoc;
}

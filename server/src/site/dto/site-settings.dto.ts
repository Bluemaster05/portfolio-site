import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsNumber,
  IsOptional,
  Max,
  Min,
  IsString,
  Length,
  MaxLength,
  ValidateNested,
  ArrayMaxSize,
} from 'class-validator';
import { LinkDto } from '../../common/dto/link.dto.js';
import { IsRichTextDoc } from '../../common/validators/is-rich-text-doc.js';
import { richTextSchema } from '../../common/dto/rich-text.schema.js';
import type { RichTextDoc } from '../../common/types/rich-text.js';
import { IsImageSource } from '../../common/validators/is-media-source.js';
import { EmptyToNull } from '../../common/validators/empty-to-null.js';

/** Which part of the avatar shows in its circle */
export class AvatarCropDto {
  /** Focus point, percent across the image (0–100) */
  @IsNumber()
  @Min(0)
  @Max(100)
  x!: number;

  /** Focus point, percent down the image (0–100) */
  @IsNumber()
  @Min(0)
  @Max(100)
  y!: number;

  /** Zoom around the focus point; 1 fills the circle with the whole image's shorter side */
  @IsNumber()
  @Min(1)
  @Max(4)
  zoom!: number;
}

/** On/off switch for each public section */
export class SectionTogglesDto {
  @IsBoolean()
  home!: boolean;

  @IsBoolean()
  projects!: boolean;

  @IsBoolean()
  experience!: boolean;

  @IsBoolean()
  education!: boolean;

  @IsBoolean()
  blog!: boolean;

  @IsBoolean()
  honors!: boolean;
}

export class SiteSettingsResponseDto {
  /** Browser tab / SEO title */
  siteTitle!: string;

  /** SEO meta description */
  siteDescription!: string;

  ownerName!: string;

  /** One line under the name, e.g. "Full-stack developer" */
  headline!: string;

  location?: string;
  contactEmail?: string;
  avatarUrl?: string;
  avatarCrop!: AvatarCropDto;

  @ApiProperty(richTextSchema('Intro shown on the home page'))
  bio!: RichTextDoc;

  links!: LinkDto[];

  sections!: SectionTogglesDto;

  updatedAt!: Date;
}

class SiteSettingsFieldsDto {
  @IsString()
  @Length(1, 120)
  siteTitle!: string;

  @IsString()
  @MaxLength(300)
  siteDescription!: string;

  @IsString()
  @Length(1, 120)
  ownerName!: string;

  @IsString()
  @MaxLength(200)
  headline!: string;

  @IsOptional()
  @EmptyToNull()
  @IsString()
  @MaxLength(120)
  location?: string;

  @IsOptional()
  @EmptyToNull()
  @IsEmail()
  @MaxLength(320)
  contactEmail?: string;

  @IsOptional()
  @EmptyToNull()
  @IsImageSource()
  @MaxLength(2048)
  avatarUrl?: string;

  @ValidateNested()
  @Type(() => AvatarCropDto)
  avatarCrop!: AvatarCropDto;

  @IsRichTextDoc('Intro shown on the home page')
  bio!: RichTextDoc;

  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => LinkDto)
  links!: LinkDto[];

  @ValidateNested()
  @Type(() => SectionTogglesDto)
  sections!: SectionTogglesDto;
}

/** Any subset of the settings; omitted fields keep their value. Send null to clear optional text. */
export class UpdateSiteSettingsDto extends PartialType(SiteSettingsFieldsDto) {}

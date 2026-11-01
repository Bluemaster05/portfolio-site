import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsOptional, IsString, Length, Matches, MaxLength } from 'class-validator';
import { ContentItemFieldsDto, ContentItemResponseDto } from '../../common/dto/content-item.dto.js';
import { richTextSchema } from '../../common/dto/rich-text.schema.js';
import { IsRichTextDoc } from '../../common/validators/is-rich-text-doc.js';
import type { RichTextDoc } from '../../common/types/rich-text.js';
import { IsImageSource } from '../../common/validators/is-image-source.js';
import { EmptyToNull } from '../../common/validators/empty-to-null.js';

export class CreateBlogPostDto extends ContentItemFieldsDto {
  @IsString()
  @Length(1, 200)
  title!: string;

  /** URL segment; generated from the title when omitted */
  @IsOptional()
  @EmptyToNull()
  @Matches(/^[a-z0-9]+(-[a-z0-9]+)*$/, { message: 'slug may only contain a-z, 0-9 and dashes' })
  @MaxLength(120)
  slug?: string;

  /** Short plain-text teaser for the list and meta description */
  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  @IsOptional()
  @IsRichTextDoc('The post', false)
  content?: RichTextDoc;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  tags?: string[];

  @IsOptional()
  @EmptyToNull()
  @IsImageSource()
  @MaxLength(2048)
  coverImageUrl?: string;
}

export class UpdateBlogPostDto extends PartialType(CreateBlogPostDto) {}

export class BlogPostResponseDto extends ContentItemResponseDto {
  title!: string;
  slug!: string;
  excerpt!: string;

  @ApiProperty(richTextSchema('The post'))
  content!: RichTextDoc;

  tags!: string[];
  coverImageUrl?: string;

  /** Set the first time the post is published */
  publishedAt?: Date;
}

/** A post without its body, for lists */
export class BlogPostSummaryDto extends OmitType(BlogPostResponseDto, ['content']) {}

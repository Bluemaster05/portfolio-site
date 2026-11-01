import { PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Length, Max, MaxLength, Min } from 'class-validator';
import { EmptyToNull } from '../../common/validators/empty-to-null.js';
import { IsImageSource } from '../../common/validators/is-media-source.js';
import { IsSafeUrl } from '../../common/validators/is-safe-url.js';

export class CreateTechnologyDto {
  /** Display name, e.g. "TypeScript" */
  @IsString()
  @Length(1, 60)
  name!: string;

  /** Icon for the pill (square works best; SVG ideal): an upload or an http(s) image URL */
  @IsOptional()
  @EmptyToNull()
  @IsImageSource()
  @MaxLength(2048)
  iconUrl?: string;

  /** Link to the technology's own site */
  @IsOptional()
  @EmptyToNull()
  @IsSafeUrl()
  @MaxLength(2048)
  url?: string;

  /** Lower numbers are listed first. Defaults to 0. */
  @IsOptional()
  @IsInt()
  @Min(-100000)
  @Max(100000)
  sortOrder?: number;
}

export class UpdateTechnologyDto extends PartialType(CreateTechnologyDto) {}

/** A technology as shown in pills on projects */
export class TechnologySummaryDto {
  id!: number;
  name!: string;
  /** Used in the project filter: `/projects?tech=<slug>` */
  slug!: string;
  iconUrl?: string;
}

export class TechnologyResponseDto extends TechnologySummaryDto {
  url?: string;
  sortOrder!: number;
  createdAt!: Date;
  updatedAt!: Date;
}

/** A technology with how many published projects use it, for the project filter */
export class TechnologyUsageDto extends TechnologySummaryDto {
  projectCount!: number;
}

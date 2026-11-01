import { PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Length, Max, MaxLength, Min } from 'class-validator';
import { EmptyToNull } from '../../common/validators/empty-to-null.js';
import { IsImageSource } from '../../common/validators/is-media-source.js';
import { IsSafeUrl } from '../../common/validators/is-safe-url.js';

export class CreateEmployerDto {
  /** Company or organization name */
  @IsString()
  @Length(1, 200)
  name!: string;

  /** The employer's website */
  @IsOptional()
  @EmptyToNull()
  @IsSafeUrl()
  @MaxLength(2048)
  url?: string;

  /** Small logo (square works best): an upload or an http(s) image URL */
  @IsOptional()
  @EmptyToNull()
  @IsImageSource()
  @MaxLength(2048)
  logoUrl?: string;

  /** Lower numbers are listed first. Defaults to 0. */
  @IsOptional()
  @IsInt()
  @Min(-100000)
  @Max(100000)
  sortOrder?: number;
}

export class UpdateEmployerDto extends PartialType(CreateEmployerDto) {}

/** An employer as shown with its jobs */
export class EmployerSummaryDto {
  id!: number;
  name!: string;
  url?: string;
  logoUrl?: string;
}

export class EmployerResponseDto extends EmployerSummaryDto {
  sortOrder!: number;
  /** Jobs at this employer, drafts included; an employer with jobs can't be deleted */
  jobCount!: number;
  createdAt!: Date;
  updatedAt!: Date;
}

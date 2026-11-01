import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

/** Fields every content item accepts on create/update. */
export class ContentItemFieldsDto {
  /** Visible on the public site. Defaults to false (draft). */
  @IsOptional()
  @IsBoolean()
  published?: boolean;

  /** Lower numbers are shown first. Defaults to 0. */
  @IsOptional()
  @IsInt()
  @Min(-100000)
  @Max(100000)
  sortOrder?: number;
}

/** Fields every content item returns. */
export class ContentItemResponseDto {
  id!: number;
  published!: boolean;
  sortOrder!: number;
  createdAt!: Date;
  updatedAt!: Date;
}

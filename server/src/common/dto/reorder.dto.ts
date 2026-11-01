import { ArrayUnique, IsArray, IsInt } from 'class-validator';

export class ReorderDto {
  /** Item ids in their new display order; items not listed keep their place after these */
  @IsArray()
  @ArrayUnique()
  @IsInt({ each: true })
  ids!: number[];
}

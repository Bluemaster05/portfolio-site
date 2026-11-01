import { IsString, Length, MaxLength } from 'class-validator';
import { IsSafeUrl } from '../validators/is-safe-url.js';

export class LinkDto {
  /** Text shown for the link, e.g. "GitHub" */
  @IsString()
  @Length(1, 60)
  label!: string;

  /** http(s) or mailto URL */
  @IsSafeUrl()
  @MaxLength(2048)
  url!: string;
}

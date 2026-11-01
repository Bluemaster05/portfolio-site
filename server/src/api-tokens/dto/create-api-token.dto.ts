import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsDateString, IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { ApiScope } from '../api-scope.enum.js';

export class CreateApiTokenDto {
  /** What the token is for, e.g. "Production site" */
  @IsString()
  @Length(1, 100)
  name!: string;

  @ApiProperty({ enum: ApiScope, enumName: 'ApiScope', isArray: true })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(ApiScope, { each: true })
  scopes!: ApiScope[];

  /** Optional ISO date-time after which the token stops working */
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

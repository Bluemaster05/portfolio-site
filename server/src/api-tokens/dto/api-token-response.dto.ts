import { ApiProperty } from '@nestjs/swagger';
import { ApiScope } from '../api-scope.enum.js';

export class ApiTokenResponseDto {
  id!: number;
  name!: string;

  /** First characters of the token, to tell tokens apart */
  prefix!: string;

  @ApiProperty({ enum: ApiScope, enumName: 'ApiScope', isArray: true })
  scopes!: ApiScope[];

  expiresAt?: Date;
  lastUsedAt?: Date;
  revokedAt?: Date;
  createdAt!: Date;
}

export class ApiTokenCreatedResponseDto extends ApiTokenResponseDto {
  /** The full token. Shown only once — store it now. */
  token!: string;
}

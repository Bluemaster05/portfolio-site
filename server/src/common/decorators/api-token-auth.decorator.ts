import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiNotFoundResponse, ApiSecurity, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Public } from './public.decorator.js';
import { ApiScope } from '../../api-tokens/api-scope.enum.js';
import { API_SCOPE_KEY, API_SECTION_KEY, ApiTokenGuard } from '../../api-tokens/api-token.guard.js';
import { Section } from '../../site/section.enum.js';
import { ErrorResponseDto } from '../dto/error-response.dto.js';

/**
 * Read-only access for the public site: skips the admin JWT guard and instead requires an
 * API token with `scope`. With `section`, the route 404s while that section is switched off.
 */
export const ApiTokenAuth = (scope: ApiScope, section?: Section) =>
  applyDecorators(
    Public(),
    SetMetadata(API_SCOPE_KEY, scope),
    SetMetadata(API_SECTION_KEY, section),
    UseGuards(ApiTokenGuard),
    ApiSecurity('api-key'),
    ApiUnauthorizedResponse({
      description: 'Missing, invalid, revoked or under-scoped API token',
      type: ErrorResponseDto,
    }),
    ...(section
      ? [ApiNotFoundResponse({ description: 'Section disabled or item not found', type: ErrorResponseDto })]
      : []),
  );

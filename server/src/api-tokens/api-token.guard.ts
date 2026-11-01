import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { ApiTokensService } from './api-tokens.service.js';
import { ApiScope } from './api-scope.enum.js';
import { SiteService } from '../site/site.service.js';
import { Section } from '../site/section.enum.js';

export const API_SCOPE_KEY = 'apiScope';
export const API_SECTION_KEY = 'apiSection';

function extractToken(req: Request): string | undefined {
  const header = req.headers['x-api-key'];
  if (typeof header === 'string' && header) return header;
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) return auth.slice('Bearer '.length).trim();
  return undefined;
}

/**
 * Lets a request through when it carries an active API token with the route's scope.
 * Routes that belong to a section also 404 while that section is switched off.
 */
@Injectable()
export class ApiTokenGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly apiTokensService: ApiTokensService,
    private readonly siteService: SiteService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()];
    const scope = this.reflector.getAllAndOverride<ApiScope | undefined>(API_SCOPE_KEY, targets);
    const section = this.reflector.getAllAndOverride<Section | undefined>(API_SECTION_KEY, targets);
    if (!scope) throw new Error('ApiTokenGuard used without @ApiTokenAuth(scope)');

    const raw = extractToken(context.switchToHttp().getRequest<Request>());
    if (!raw || !(await this.apiTokensService.verify(raw, scope))) {
      throw new UnauthorizedException('A valid API token with the required scope is needed');
    }

    if (section && !(await this.siteService.isSectionEnabled(section))) {
      throw new NotFoundException('This section is not enabled');
    }
    return true;
  }
}

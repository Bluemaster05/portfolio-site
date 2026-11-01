import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiCookieAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SiteService } from './site.service.js';
import { SiteSettingsResponseDto, UpdateSiteSettingsDto } from './dto/site-settings.dto.js';
import { ApiTokenAuth } from '../common/decorators/api-token-auth.decorator.js';
import { ApiScope } from '../api-tokens/api-scope.enum.js';

@ApiTags('admin: site')
@ApiCookieAuth('access_token')
@Controller('admin/site')
export class SiteAdminController {
  constructor(private readonly siteService: SiteService) {}

  @Get()
  @ApiOperation({ summary: 'Site settings, profile, and section toggles' })
  @ApiOkResponse({ type: SiteSettingsResponseDto })
  get(): Promise<SiteSettingsResponseDto> {
    return this.siteService.getSettings();
  }

  @Patch()
  @ApiOperation({ summary: 'Update site settings, profile, or section toggles' })
  @ApiOkResponse({ type: SiteSettingsResponseDto })
  update(@Body() dto: UpdateSiteSettingsDto): Promise<SiteSettingsResponseDto> {
    return this.siteService.update(dto);
  }
}

@ApiTags('public')
@Controller('public/site')
export class SitePublicController {
  constructor(private readonly siteService: SiteService) {}

  @Get()
  @ApiTokenAuth(ApiScope.Site)
  @ApiOperation({ summary: 'Site settings, profile, and which sections are enabled' })
  @ApiOkResponse({ type: SiteSettingsResponseDto })
  get(): Promise<SiteSettingsResponseDto> {
    return this.siteService.getSettings();
  }
}

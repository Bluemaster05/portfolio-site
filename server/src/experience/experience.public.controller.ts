import { Controller, Get, Param } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ExperienceService } from './experience.service.js';
import { ExperienceGroupDto, ExperienceResponseDto } from './dto/experience.dto.js';
import { ApiTokenAuth } from '../common/decorators/api-token-auth.decorator.js';
import { ApiScope } from '../api-tokens/api-scope.enum.js';
import { Section } from '../site/section.enum.js';
import { ErrorResponseDto } from '../common/dto/error-response.dto.js';
import { toExperienceResponse } from './experience.mapper.js';

@ApiTags('public')
@ApiTokenAuth(ApiScope.Experience, Section.Experience)
@Controller('public/experience')
export class ExperiencePublicController {
  constructor(private readonly experienceService: ExperienceService) {}

  @Get()
  @ApiOperation({ summary: 'Published jobs grouped by employer, in display order' })
  @ApiOkResponse({ type: [ExperienceGroupDto] })
  findAll(): Promise<ExperienceGroupDto[]> {
    return this.experienceService.publishedByEmployer();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'A published job by slug, with its write-up' })
  @ApiOkResponse({ type: ExperienceResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  async findOne(@Param('slug') slug: string): Promise<ExperienceResponseDto> {
    return toExperienceResponse(await this.experienceService.findPublishedOne({ slug }));
  }
}

import { Controller, Get, Param, ParseBoolPipe, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
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
  @ApiQuery({
    name: 'featured',
    required: false,
    type: Boolean,
    description: 'Only the featured job (at most one), in its employer group',
  })
  @ApiOkResponse({ type: [ExperienceGroupDto] })
  findAll(
    @Query('featured', new ParseBoolPipe({ optional: true })) featured?: boolean,
  ): Promise<ExperienceGroupDto[]> {
    return this.experienceService.publishedByEmployer(featured ?? false);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'A published job by slug, with its write-up' })
  @ApiOkResponse({ type: ExperienceResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  async findOne(@Param('slug') slug: string): Promise<ExperienceResponseDto> {
    return toExperienceResponse(await this.experienceService.findPublishedOne({ slug }));
  }
}

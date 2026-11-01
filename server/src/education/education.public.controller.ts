import { Controller, Get, Param, ParseBoolPipe, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { EducationService } from './education.service.js';
import { EducationResponseDto, EducationSummaryDto } from './dto/education.dto.js';
import { ApiTokenAuth } from '../common/decorators/api-token-auth.decorator.js';
import { ApiScope } from '../api-tokens/api-scope.enum.js';
import { Section } from '../site/section.enum.js';
import { ErrorResponseDto } from '../common/dto/error-response.dto.js';
import { toSummary } from '../common/utils/to-summary.js';

@ApiTags('public')
@ApiTokenAuth(ApiScope.Education, Section.Education)
@Controller('public/education')
export class EducationPublicController {
  constructor(private readonly educationService: EducationService) {}

  @Get()
  @ApiOperation({ summary: 'Published education entries in display order, without write-ups' })
  @ApiQuery({ name: 'featured', required: false, type: Boolean, description: 'Only the featured entry (at most one)' })
  @ApiOkResponse({ type: [EducationSummaryDto] })
  async findAll(
    @Query('featured', new ParseBoolPipe({ optional: true })) featured?: boolean,
  ): Promise<EducationSummaryDto[]> {
    const entries = await this.educationService.findPublished(featured ? { featured: true } : {});
    return entries.map((entry) => toSummary(entry, 'writeup'));
  }

  @Get(':slug')
  @ApiOperation({ summary: 'A published education entry by slug, with its write-up' })
  @ApiOkResponse({ type: EducationResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  findOne(@Param('slug') slug: string): Promise<EducationResponseDto> {
    return this.educationService.findPublishedOne({ slug });
  }
}

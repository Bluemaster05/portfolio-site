import { Controller, Get, Param, ParseBoolPipe, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { HonorsService } from './honors.service.js';
import { HonorResponseDto, HonorSummaryDto } from './dto/honor.dto.js';
import { ApiTokenAuth } from '../common/decorators/api-token-auth.decorator.js';
import { ApiScope } from '../api-tokens/api-scope.enum.js';
import { Section } from '../site/section.enum.js';
import { ErrorResponseDto } from '../common/dto/error-response.dto.js';
import { toSummary } from '../common/utils/to-summary.js';

@ApiTags('public')
@ApiTokenAuth(ApiScope.Honors, Section.Honors)
@Controller('public/honors')
export class HonorsPublicController {
  constructor(private readonly honorsService: HonorsService) {}

  @Get()
  @ApiOperation({ summary: 'Published honors in display order, without write-ups' })
  @ApiQuery({ name: 'featured', required: false, type: Boolean, description: 'Only the featured honor (at most one)' })
  @ApiOkResponse({ type: [HonorSummaryDto] })
  async findAll(
    @Query('featured', new ParseBoolPipe({ optional: true })) featured?: boolean,
  ): Promise<HonorSummaryDto[]> {
    const honors = await this.honorsService.findPublished(featured ? { featured: true } : {});
    return honors.map((honor) => toSummary(honor, 'writeup'));
  }

  @Get(':slug')
  @ApiOperation({ summary: 'A published honor by slug, with its write-up' })
  @ApiOkResponse({ type: HonorResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  findOne(@Param('slug') slug: string): Promise<HonorResponseDto> {
    return this.honorsService.findPublishedOne({ slug });
  }
}

import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ExperienceService } from './experience.service.js';
import { ExperienceResponseDto } from './dto/experience.dto.js';
import { ApiTokenAuth } from '../common/decorators/api-token-auth.decorator.js';
import { ApiScope } from '../api-tokens/api-scope.enum.js';
import { Section } from '../site/section.enum.js';

@ApiTags('public')
@ApiTokenAuth(ApiScope.Experience, Section.Experience)
@Controller('public/experience')
export class ExperiencePublicController {
  constructor(private readonly experienceService: ExperienceService) {}

  @Get()
  @ApiOperation({ summary: 'Published experience entries in display order' })
  @ApiOkResponse({ type: [ExperienceResponseDto] })
  findAll(): Promise<ExperienceResponseDto[]> {
    return this.experienceService.findPublished();
  }
}

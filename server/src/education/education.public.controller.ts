import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EducationService } from './education.service.js';
import { EducationResponseDto } from './dto/education.dto.js';
import { ApiTokenAuth } from '../common/decorators/api-token-auth.decorator.js';
import { ApiScope } from '../api-tokens/api-scope.enum.js';
import { Section } from '../site/section.enum.js';

@ApiTags('public')
@ApiTokenAuth(ApiScope.Education, Section.Education)
@Controller('public/education')
export class EducationPublicController {
  constructor(private readonly educationService: EducationService) {}

  @Get()
  @ApiOperation({ summary: 'Published education entries in display order' })
  @ApiOkResponse({ type: [EducationResponseDto] })
  findAll(): Promise<EducationResponseDto[]> {
    return this.educationService.findPublished();
  }
}

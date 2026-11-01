import { Controller, Get, Param, ParseBoolPipe, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProjectsService } from './projects.service.js';
import { ProjectResponseDto, ProjectSummaryDto } from './dto/project.dto.js';
import { ApiTokenAuth } from '../common/decorators/api-token-auth.decorator.js';
import { ApiScope } from '../api-tokens/api-scope.enum.js';
import { Section } from '../site/section.enum.js';
import { toSummary } from '../common/utils/to-summary.js';

@ApiTags('public')
@ApiTokenAuth(ApiScope.Projects, Section.Projects)
@Controller('public/projects')
export class ProjectsPublicController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'Published projects in display order' })
  @ApiQuery({ name: 'featured', required: false, type: Boolean, description: 'Only featured projects' })
  @ApiOkResponse({ type: [ProjectSummaryDto] })
  async findAll(
    @Query('featured', new ParseBoolPipe({ optional: true })) featured?: boolean,
  ): Promise<ProjectSummaryDto[]> {
    const projects = await this.projectsService.findPublished(featured ? { featured: true } : {});
    return projects.map((project) => toSummary(project, 'content'));
  }

  @Get(':slug')
  @ApiOperation({ summary: 'A published project by slug' })
  @ApiOkResponse({ type: ProjectResponseDto })
  findOne(@Param('slug') slug: string): Promise<ProjectResponseDto> {
    return this.projectsService.findPublishedOne({ slug });
  }
}

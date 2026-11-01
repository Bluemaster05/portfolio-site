import { Controller, Get, Param, ParseBoolPipe, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ProjectsService } from './projects.service.js';
import { ProjectResponseDto, ProjectSummaryDto } from './dto/project.dto.js';
import { ApiTokenAuth } from '../common/decorators/api-token-auth.decorator.js';
import { ApiScope } from '../api-tokens/api-scope.enum.js';
import { Section } from '../site/section.enum.js';
import { toProjectResponse, toProjectSummary } from './project.mapper.js';
import { TechnologyUsageDto } from '../technologies/dto/technology.dto.js';

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
    return projects.map(toProjectSummary);
  }

  // Declared before ':slug' so "technologies" isn't read as a project slug
  @Get('technologies')
  @ApiOperation({ summary: 'Technologies used by published projects, with counts, for filtering' })
  @ApiOkResponse({ type: [TechnologyUsageDto] })
  technologies(): Promise<TechnologyUsageDto[]> {
    return this.projectsService.technologyUsage();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'A published project by slug' })
  @ApiOkResponse({ type: ProjectResponseDto })
  async findOne(@Param('slug') slug: string): Promise<ProjectResponseDto> {
    return toProjectResponse(await this.projectsService.findPublishedOne({ slug }));
  }
}

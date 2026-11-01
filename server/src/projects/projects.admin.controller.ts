import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ProjectsService } from './projects.service.js';
import { CreateProjectDto, ProjectResponseDto, UpdateProjectDto } from './dto/project.dto.js';
import { ReorderDto } from '../common/dto/reorder.dto.js';
import { toProjectResponse } from './project.mapper.js';
import { ErrorResponseDto } from '../common/dto/error-response.dto.js';

@ApiTags('admin: projects')
@ApiCookieAuth('access_token')
@Controller('admin/projects')
export class ProjectsAdminController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'List all projects, drafts included' })
  @ApiOkResponse({ type: [ProjectResponseDto] })
  async findAll(): Promise<ProjectResponseDto[]> {
    return (await this.projectsService.findAll()).map(toProjectResponse);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project' })
  @ApiOkResponse({ type: ProjectResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ProjectResponseDto> {
    return toProjectResponse(await this.projectsService.findOne(id));
  }

  @Post()
  @ApiOperation({ summary: 'Create a project' })
  @ApiCreatedResponse({ type: ProjectResponseDto })
  @ApiConflictResponse({ description: 'Slug already used', type: ErrorResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid fields or unknown technology ids', type: ErrorResponseDto })
  async create(@Body() dto: CreateProjectDto): Promise<ProjectResponseDto> {
    return toProjectResponse(await this.projectsService.createProject(dto));
  }

  @Put('order')
  @ApiOperation({ summary: 'Set the display order of projects' })
  @ApiOkResponse({ type: [ProjectResponseDto] })
  async reorder(@Body() dto: ReorderDto): Promise<ProjectResponseDto[]> {
    return (await this.projectsService.reorder(dto.ids)).map(toProjectResponse);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project' })
  @ApiOkResponse({ type: ProjectResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  @ApiConflictResponse({ description: 'Slug already used', type: ErrorResponseDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProjectDto,
  ): Promise<ProjectResponseDto> {
    return toProjectResponse(await this.projectsService.updateProject(id, dto));
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a project' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.projectsService.remove(id);
  }
}

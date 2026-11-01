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
import { ExperienceService } from './experience.service.js';
import {
  CreateExperienceDto,
  ExperienceResponseDto,
  UpdateExperienceDto,
} from './dto/experience.dto.js';
import { ReorderDto } from '../common/dto/reorder.dto.js';
import { ErrorResponseDto } from '../common/dto/error-response.dto.js';
import { toExperienceResponse } from './experience.mapper.js';

@ApiTags('admin: experience')
@ApiCookieAuth('access_token')
@Controller('admin/experience')
export class ExperienceAdminController {
  constructor(private readonly experienceService: ExperienceService) {}

  @Get()
  @ApiOperation({ summary: 'List all jobs, drafts included' })
  @ApiOkResponse({ type: [ExperienceResponseDto] })
  async findAll(): Promise<ExperienceResponseDto[]> {
    return (await this.experienceService.findAll()).map(toExperienceResponse);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a job' })
  @ApiOkResponse({ type: ExperienceResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ExperienceResponseDto> {
    return toExperienceResponse(await this.experienceService.findOne(id));
  }

  @Post()
  @ApiOperation({ summary: 'Create a job' })
  @ApiCreatedResponse({ type: ExperienceResponseDto })
  @ApiBadRequestResponse({ description: 'Unknown employer or technology', type: ErrorResponseDto })
  @ApiConflictResponse({ description: 'Slug already used', type: ErrorResponseDto })
  async create(@Body() dto: CreateExperienceDto): Promise<ExperienceResponseDto> {
    return toExperienceResponse(await this.experienceService.createJob(dto));
  }

  @Put('order')
  @ApiOperation({ summary: 'Set the display order of jobs (within each employer on the public page)' })
  @ApiOkResponse({ type: [ExperienceResponseDto] })
  async reorder(@Body() dto: ReorderDto): Promise<ExperienceResponseDto[]> {
    return (await this.experienceService.reorder(dto.ids)).map(toExperienceResponse);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a job' })
  @ApiOkResponse({ type: ExperienceResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  @ApiBadRequestResponse({ description: 'Unknown employer or technology', type: ErrorResponseDto })
  @ApiConflictResponse({ description: 'Slug already used', type: ErrorResponseDto })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExperienceDto,
  ): Promise<ExperienceResponseDto> {
    return toExperienceResponse(await this.experienceService.updateJob(id, dto));
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a job' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.experienceService.remove(id);
  }
}

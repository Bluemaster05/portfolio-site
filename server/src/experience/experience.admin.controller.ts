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

@ApiTags('admin: experience')
@ApiCookieAuth('access_token')
@Controller('admin/experience')
export class ExperienceAdminController {
  constructor(private readonly experienceService: ExperienceService) {}

  @Get()
  @ApiOperation({ summary: 'List all experience entries, drafts included' })
  @ApiOkResponse({ type: [ExperienceResponseDto] })
  findAll(): Promise<ExperienceResponseDto[]> {
    return this.experienceService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an experience entry' })
  @ApiOkResponse({ type: ExperienceResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<ExperienceResponseDto> {
    return this.experienceService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create an experience entry' })
  @ApiCreatedResponse({ type: ExperienceResponseDto })
  create(@Body() dto: CreateExperienceDto): Promise<ExperienceResponseDto> {
    return this.experienceService.create(dto);
  }

  @Put('order')
  @ApiOperation({ summary: 'Set the display order of experience entries' })
  @ApiOkResponse({ type: [ExperienceResponseDto] })
  reorder(@Body() dto: ReorderDto): Promise<ExperienceResponseDto[]> {
    return this.experienceService.reorder(dto.ids);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an experience entry' })
  @ApiOkResponse({ type: ExperienceResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateExperienceDto,
  ): Promise<ExperienceResponseDto> {
    return this.experienceService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete an experience entry' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.experienceService.remove(id);
  }
}

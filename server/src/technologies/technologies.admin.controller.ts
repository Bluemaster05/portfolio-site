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
import { TechnologiesService } from './technologies.service.js';
import { CreateTechnologyDto, TechnologyResponseDto, UpdateTechnologyDto } from './dto/technology.dto.js';
import { ReorderDto } from '../common/dto/reorder.dto.js';
import { ErrorResponseDto } from '../common/dto/error-response.dto.js';

@ApiTags('admin: technologies')
@ApiCookieAuth('access_token')
@Controller('admin/technologies')
export class TechnologiesAdminController {
  constructor(private readonly technologiesService: TechnologiesService) {}

  @Get()
  @ApiOperation({ summary: 'List technologies in display order' })
  @ApiOkResponse({ type: [TechnologyResponseDto] })
  findAll(): Promise<TechnologyResponseDto[]> {
    return this.technologiesService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a technology' })
  @ApiCreatedResponse({ type: TechnologyResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  @ApiConflictResponse({ description: 'Name already used', type: ErrorResponseDto })
  create(@Body() dto: CreateTechnologyDto): Promise<TechnologyResponseDto> {
    return this.technologiesService.create(dto);
  }

  @Put('order')
  @ApiOperation({ summary: 'Set the display order of technologies' })
  @ApiOkResponse({ type: [TechnologyResponseDto] })
  reorder(@Body() dto: ReorderDto): Promise<TechnologyResponseDto[]> {
    return this.technologiesService.reorder(dto.ids);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a technology' })
  @ApiOkResponse({ type: TechnologyResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  @ApiConflictResponse({ description: 'Name already used', type: ErrorResponseDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTechnologyDto): Promise<TechnologyResponseDto> {
    return this.technologiesService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a technology; projects using it lose it' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.technologiesService.remove(id);
  }
}

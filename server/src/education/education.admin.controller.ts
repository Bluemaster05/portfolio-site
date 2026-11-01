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
import { EducationService } from './education.service.js';
import {
  CreateEducationDto,
  EducationResponseDto,
  UpdateEducationDto,
} from './dto/education.dto.js';
import { ReorderDto } from '../common/dto/reorder.dto.js';
import { ErrorResponseDto } from '../common/dto/error-response.dto.js';

@ApiTags('admin: education')
@ApiCookieAuth('access_token')
@Controller('admin/education')
export class EducationAdminController {
  constructor(private readonly educationService: EducationService) {}

  @Get()
  @ApiOperation({ summary: 'List all education entries, drafts included' })
  @ApiOkResponse({ type: [EducationResponseDto] })
  findAll(): Promise<EducationResponseDto[]> {
    return this.educationService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an education entry' })
  @ApiOkResponse({ type: EducationResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<EducationResponseDto> {
    return this.educationService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create an education entry' })
  @ApiCreatedResponse({ type: EducationResponseDto })
  create(@Body() dto: CreateEducationDto): Promise<EducationResponseDto> {
    return this.educationService.createEntry(dto);
  }

  @Put('order')
  @ApiOperation({ summary: 'Set the display order of education entries' })
  @ApiOkResponse({ type: [EducationResponseDto] })
  reorder(@Body() dto: ReorderDto): Promise<EducationResponseDto[]> {
    return this.educationService.reorder(dto.ids);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an education entry' })
  @ApiOkResponse({ type: EducationResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEducationDto,
  ): Promise<EducationResponseDto> {
    return this.educationService.updateEntry(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete an education entry' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.educationService.remove(id);
  }
}

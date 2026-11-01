import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { EmployersService } from './employers.service.js';
import { CreateEmployerDto, EmployerResponseDto, UpdateEmployerDto } from './dto/employer.dto.js';
import { ReorderDto } from '../common/dto/reorder.dto.js';
import { ErrorResponseDto } from '../common/dto/error-response.dto.js';

@ApiTags('admin: employers')
@ApiCookieAuth('access_token')
@Controller('admin/employers')
export class EmployersAdminController {
  constructor(private readonly employersService: EmployersService) {}

  @Get()
  @ApiOperation({ summary: 'List employers in display order, with their job counts' })
  @ApiOkResponse({ type: [EmployerResponseDto] })
  findAll(): Promise<EmployerResponseDto[]> {
    return this.employersService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create an employer' })
  @ApiCreatedResponse({ type: EmployerResponseDto })
  @ApiConflictResponse({ description: 'Name already used', type: ErrorResponseDto })
  create(@Body() dto: CreateEmployerDto): Promise<EmployerResponseDto> {
    return this.employersService.create(dto);
  }

  @Put('order')
  @ApiOperation({ summary: 'Set the display order of employers' })
  @ApiOkResponse({ type: [EmployerResponseDto] })
  reorder(@Body() dto: ReorderDto): Promise<EmployerResponseDto[]> {
    return this.employersService.reorder(dto.ids);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an employer' })
  @ApiOkResponse({ type: EmployerResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  @ApiConflictResponse({ description: 'Name already used', type: ErrorResponseDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateEmployerDto): Promise<EmployerResponseDto> {
    return this.employersService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete an employer that has no jobs' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  @ApiConflictResponse({ description: 'The employer still has jobs', type: ErrorResponseDto })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.employersService.remove(id);
  }
}

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
import { HonorsService } from './honors.service.js';
import {
  CreateHonorDto,
  HonorResponseDto,
  UpdateHonorDto,
} from './dto/honor.dto.js';
import { ReorderDto } from '../common/dto/reorder.dto.js';
import { ErrorResponseDto } from '../common/dto/error-response.dto.js';

@ApiTags('admin: honors')
@ApiCookieAuth('access_token')
@Controller('admin/honors')
export class HonorsAdminController {
  constructor(private readonly honorsService: HonorsService) {}

  @Get()
  @ApiOperation({ summary: 'List all honors, drafts included' })
  @ApiOkResponse({ type: [HonorResponseDto] })
  findAll(): Promise<HonorResponseDto[]> {
    return this.honorsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an honor' })
  @ApiOkResponse({ type: HonorResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<HonorResponseDto> {
    return this.honorsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create an honor' })
  @ApiCreatedResponse({ type: HonorResponseDto })
  create(@Body() dto: CreateHonorDto): Promise<HonorResponseDto> {
    return this.honorsService.create(dto);
  }

  @Put('order')
  @ApiOperation({ summary: 'Set the display order of honors' })
  @ApiOkResponse({ type: [HonorResponseDto] })
  reorder(@Body() dto: ReorderDto): Promise<HonorResponseDto[]> {
    return this.honorsService.reorder(dto.ids);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an honor' })
  @ApiOkResponse({ type: HonorResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHonorDto,
  ): Promise<HonorResponseDto> {
    return this.honorsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete an honor' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.honorsService.remove(id);
  }
}

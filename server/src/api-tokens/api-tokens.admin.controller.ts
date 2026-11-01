import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
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
import { ApiTokensService } from './api-tokens.service.js';
import { CreateApiTokenDto } from './dto/create-api-token.dto.js';
import { ApiTokenCreatedResponseDto, ApiTokenResponseDto } from './dto/api-token-response.dto.js';
import { ErrorResponseDto } from '../common/dto/error-response.dto.js';
import { wrap } from '@mikro-orm/core';

@ApiTags('admin: api tokens')
@ApiCookieAuth('access_token')
@Controller('admin/api-tokens')
export class ApiTokensAdminController {
  constructor(private readonly apiTokensService: ApiTokensService) {}

  @Get()
  @ApiOperation({ summary: 'List API tokens (without their secret values)' })
  @ApiOkResponse({ type: [ApiTokenResponseDto] })
  findAll(): Promise<ApiTokenResponseDto[]> {
    return this.apiTokensService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a read-only API token; the token value is returned only here' })
  @ApiCreatedResponse({ type: ApiTokenCreatedResponseDto })
  async create(@Body() dto: CreateApiTokenDto): Promise<ApiTokenCreatedResponseDto> {
    const { token, rawToken } = await this.apiTokensService.create(dto);
    return { ...wrap(token).toObject(), token: rawToken };
  }

  @Post(':id/revoke')
  @HttpCode(200)
  @ApiOperation({ summary: 'Revoke an API token; it stops working immediately' })
  @ApiOkResponse({ type: ApiTokenResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  revoke(@Param('id', ParseIntPipe) id: number): Promise<ApiTokenResponseDto> {
    return this.apiTokensService.revoke(id);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete an API token' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.apiTokensService.remove(id);
  }
}

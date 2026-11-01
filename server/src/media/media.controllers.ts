import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { tmpdir } from 'node:os';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiPayloadTooLargeResponse,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { existsSync } from 'node:fs';
import { MediaService, maxUploadBytes } from './media.service.js';
import { MediaAssetResponseDto } from './dto/media-asset.dto.js';
import { ErrorResponseDto } from '../common/dto/error-response.dto.js';
import { Public } from '../common/decorators/public.decorator.js';

@ApiTags('admin: media')
@ApiCookieAuth('access_token')
@Controller('admin/media')
export class MediaAdminController {
  constructor(private readonly mediaService: MediaService) {}

  @Post()
  // Written to a temp file rather than memory, so large videos don't sit in RAM
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({ destination: tmpdir() }),
      limits: { fileSize: maxUploadBytes(), files: 1 },
    }),
  )
  @ApiOperation({
    summary: 'Upload an image (PNG, JPEG, GIF, WebP, AVIF, SVG) or video (MP4, WebM)',
    description:
      'Send multipart/form-data with the file in a `file` field. Store the returned `url` in content. ' +
      'Images are limited to MAX_UPLOAD_MB, videos to MAX_VIDEO_UPLOAD_MB.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary', description: 'The image or video file' } },
    },
  })
  @ApiCreatedResponse({ type: MediaAssetResponseDto })
  @ApiBadRequestResponse({ description: 'Missing file or unsupported type', type: ErrorResponseDto })
  @ApiPayloadTooLargeResponse({ description: 'Over the size limit for its type', type: ErrorResponseDto })
  upload(@UploadedFile() file: Express.Multer.File | undefined): Promise<MediaAssetResponseDto> {
    if (!file) throw new BadRequestException('Attach a file in the "file" field');
    return this.mediaService.upload(file);
  }

  @Get()
  @ApiOperation({ summary: 'List uploaded files, newest first' })
  @ApiOkResponse({ type: [MediaAssetResponseDto] })
  findAll(): Promise<MediaAssetResponseDto[]> {
    return this.mediaService.findAll();
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete an uploaded file' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.mediaService.remove(id);
  }
}

@ApiTags('media')
@Controller('media')
export class MediaPublicController {
  constructor(private readonly mediaService: MediaService) {}

  /**
   * Public so images load for every visitor; keys are random UUIDs. The frontend proxies
   * /media/<key> here, so pages reference images on their own origin.
   */
  @Public()
  @Get(':key')
  @ApiOperation({ summary: 'Serve an uploaded image or video (supports Range requests)' })
  @ApiProduces('image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/avif', 'image/svg+xml', 'video/mp4', 'video/webm')
  @ApiOkResponse({ description: 'The file' })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  serve(@Param('key') key: string, @Res() res: Response): void {
    const file = this.mediaService.resolveFile(key);
    if (!file || !existsSync(file.path)) throw new NotFoundException('Media not found');

    res.setHeader('Content-Type', file.mimeType);
    // Keys never change content, so browsers and CDNs may cache forever
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Opened directly, an SVG can't run anything or load other resources
    res.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; sandbox");
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.sendFile(file.path);
  }
}

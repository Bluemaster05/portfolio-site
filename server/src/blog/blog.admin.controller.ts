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
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { BlogService } from './blog.service.js';
import { CreateBlogPostDto, BlogPostResponseDto, UpdateBlogPostDto } from './dto/blog-post.dto.js';
import { ReorderDto } from '../common/dto/reorder.dto.js';
import { ErrorResponseDto } from '../common/dto/error-response.dto.js';

@ApiTags('admin: blog')
@ApiCookieAuth('access_token')
@Controller('admin/blog')
export class BlogAdminController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  @ApiOperation({ summary: 'List all blog posts, drafts included' })
  @ApiOkResponse({ type: [BlogPostResponseDto] })
  findAll(): Promise<BlogPostResponseDto[]> {
    return this.blogService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a blog post' })
  @ApiOkResponse({ type: BlogPostResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<BlogPostResponseDto> {
    return this.blogService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a blog post' })
  @ApiCreatedResponse({ type: BlogPostResponseDto })
  @ApiConflictResponse({ description: 'Slug already used', type: ErrorResponseDto })
  create(@Body() dto: CreateBlogPostDto): Promise<BlogPostResponseDto> {
    return this.blogService.create(dto);
  }

  @Put('order')
  @ApiOperation({ summary: 'Set the display order of blog posts' })
  @ApiOkResponse({ type: [BlogPostResponseDto] })
  reorder(@Body() dto: ReorderDto): Promise<BlogPostResponseDto[]> {
    return this.blogService.reorder(dto.ids);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a blog post' })
  @ApiOkResponse({ type: BlogPostResponseDto })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  @ApiConflictResponse({ description: 'Slug already used', type: ErrorResponseDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateBlogPostDto,
  ): Promise<BlogPostResponseDto> {
    return this.blogService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a blog post' })
  @ApiNoContentResponse()
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.blogService.remove(id);
  }
}

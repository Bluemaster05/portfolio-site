import { Controller, Get, Param } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BlogService } from './blog.service.js';
import { BlogPostResponseDto, BlogPostSummaryDto } from './dto/blog-post.dto.js';
import { ApiTokenAuth } from '../common/decorators/api-token-auth.decorator.js';
import { ApiScope } from '../api-tokens/api-scope.enum.js';
import { Section } from '../site/section.enum.js';
import { toSummary } from '../common/utils/to-summary.js';

@ApiTags('public')
@ApiTokenAuth(ApiScope.Blog, Section.Blog)
@Controller('public/blog')
export class BlogPublicController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  @ApiOperation({ summary: 'Published posts, newest first' })
  @ApiOkResponse({ type: [BlogPostSummaryDto] })
  async findAll(): Promise<BlogPostSummaryDto[]> {
    const posts = await this.blogService.findPublished();
    return posts.map((post) => toSummary(post, 'content'));
  }

  @Get(':slug')
  @ApiOperation({ summary: 'A published post by slug' })
  @ApiOkResponse({ type: BlogPostResponseDto })
  findOne(@Param('slug') slug: string): Promise<BlogPostResponseDto> {
    return this.blogService.findPublishedOne({ slug });
  }
}

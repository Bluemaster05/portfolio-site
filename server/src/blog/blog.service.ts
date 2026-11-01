import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { ContentService } from '../common/content.service.js';
import { slugify } from '../common/utils/slugify.js';
import { BlogPost } from './entities/blog-post.entity.js';

@Injectable()
export class BlogService extends ContentService<BlogPost> {
  protected readonly entity = BlogPost;
  protected readonly label = 'Blog post';
  // Newest first; sortOrder still lets a post be pinned to the top
  protected readonly orderBy: Record<string, 'asc' | 'desc'>[] = [
    { sortOrder: 'asc' },
    { publishedAt: 'desc' },
    { id: 'desc' },
  ];

  constructor(em: EntityManager) {
    super(em);
  }

  protected beforeSave(post: BlogPost): void {
    if (!post.slug) post.slug = slugify(post.title);
    if (post.published && !post.publishedAt) post.publishedAt = new Date();
  }
}

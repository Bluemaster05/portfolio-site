import { Module } from '@nestjs/common';
import { BlogService } from './blog.service.js';
import { BlogAdminController } from './blog.admin.controller.js';
import { BlogPublicController } from './blog.public.controller.js';

@Module({
  controllers: [BlogAdminController, BlogPublicController],
  providers: [BlogService],
})
export class BlogModule {}

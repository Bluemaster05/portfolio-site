import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service.js';
import { ProjectsAdminController } from './projects.admin.controller.js';
import { ProjectsPublicController } from './projects.public.controller.js';

@Module({
  controllers: [ProjectsAdminController, ProjectsPublicController],
  providers: [ProjectsService],
})
export class ProjectsModule {}

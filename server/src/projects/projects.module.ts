import { Module } from '@nestjs/common';
import { TechnologiesModule } from '../technologies/technologies.module.js';
import { ProjectsService } from './projects.service.js';
import { ProjectsAdminController } from './projects.admin.controller.js';
import { ProjectsPublicController } from './projects.public.controller.js';

@Module({
  imports: [TechnologiesModule],
  controllers: [ProjectsAdminController, ProjectsPublicController],
  providers: [ProjectsService],
})
export class ProjectsModule {}

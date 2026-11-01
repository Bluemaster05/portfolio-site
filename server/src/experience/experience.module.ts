import { Module } from '@nestjs/common';
import { ExperienceService } from './experience.service.js';
import { ExperienceAdminController } from './experience.admin.controller.js';
import { ExperiencePublicController } from './experience.public.controller.js';

@Module({
  controllers: [ExperienceAdminController, ExperiencePublicController],
  providers: [ExperienceService],
})
export class ExperienceModule {}

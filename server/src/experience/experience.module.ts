import { Module } from '@nestjs/common';
import { TechnologiesModule } from '../technologies/technologies.module.js';
import { ExperienceService } from './experience.service.js';
import { EmployersService } from './employers.service.js';
import { ExperienceAdminController } from './experience.admin.controller.js';
import { ExperiencePublicController } from './experience.public.controller.js';
import { EmployersAdminController } from './employers.admin.controller.js';

@Module({
  imports: [TechnologiesModule],
  controllers: [ExperienceAdminController, ExperiencePublicController, EmployersAdminController],
  providers: [ExperienceService, EmployersService],
})
export class ExperienceModule {}

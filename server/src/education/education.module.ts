import { Module } from '@nestjs/common';
import { EducationService } from './education.service.js';
import { EducationAdminController } from './education.admin.controller.js';
import { EducationPublicController } from './education.public.controller.js';

@Module({
  controllers: [EducationAdminController, EducationPublicController],
  providers: [EducationService],
})
export class EducationModule {}

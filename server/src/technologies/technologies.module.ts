import { Module } from '@nestjs/common';
import { TechnologiesService } from './technologies.service.js';
import { TechnologiesAdminController } from './technologies.admin.controller.js';

@Module({
  controllers: [TechnologiesAdminController],
  providers: [TechnologiesService],
  exports: [TechnologiesService],
})
export class TechnologiesModule {}

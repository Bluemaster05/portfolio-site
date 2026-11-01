import { Module } from '@nestjs/common';
import { HonorsService } from './honors.service.js';
import { HonorsAdminController } from './honors.admin.controller.js';
import { HonorsPublicController } from './honors.public.controller.js';

@Module({
  controllers: [HonorsAdminController, HonorsPublicController],
  providers: [HonorsService],
})
export class HonorsModule {}

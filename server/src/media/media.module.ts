import { Module } from '@nestjs/common';
import { MediaService } from './media.service.js';
import { MediaAdminController, MediaPublicController } from './media.controllers.js';

@Module({
  controllers: [MediaAdminController, MediaPublicController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}

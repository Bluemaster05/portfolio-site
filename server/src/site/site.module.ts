import { Global, Module } from '@nestjs/common';
import { SiteService } from './site.service.js';
import { SiteAdminController, SitePublicController } from './site.controllers.js';

/** Global so the API token guard can check section toggles from any module. */
@Global()
@Module({
  controllers: [SiteAdminController, SitePublicController],
  providers: [SiteService],
  exports: [SiteService],
})
export class SiteModule {}

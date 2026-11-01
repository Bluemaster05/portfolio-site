import { Global, Module } from '@nestjs/common';
import { ApiTokensService } from './api-tokens.service.js';
import { ApiTokensAdminController } from './api-tokens.admin.controller.js';
import { ApiTokenGuard } from './api-token.guard.js';

/** Global so any module's public controller can use `@ApiTokenAuth`. */
@Global()
@Module({
  controllers: [ApiTokensAdminController],
  providers: [ApiTokensService, ApiTokenGuard],
  exports: [ApiTokensService, ApiTokenGuard],
})
export class ApiTokensModule {}

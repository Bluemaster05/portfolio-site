import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator.js';
import { MessageResponseDto } from '../common/dto/message-response.dto.js';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Liveness check' })
  @ApiOkResponse({ type: MessageResponseDto })
  check(): MessageResponseDto {
    return { message: 'ok' };
  }
}

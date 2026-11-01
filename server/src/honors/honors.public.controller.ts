import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HonorsService } from './honors.service.js';
import { HonorResponseDto } from './dto/honor.dto.js';
import { ApiTokenAuth } from '../common/decorators/api-token-auth.decorator.js';
import { ApiScope } from '../api-tokens/api-scope.enum.js';
import { Section } from '../site/section.enum.js';

@ApiTags('public')
@ApiTokenAuth(ApiScope.Honors, Section.Honors)
@Controller('public/honors')
export class HonorsPublicController {
  constructor(private readonly honorsService: HonorsService) {}

  @Get()
  @ApiOperation({ summary: 'Published honors in display order' })
  @ApiOkResponse({ type: [HonorResponseDto] })
  findAll(): Promise<HonorResponseDto[]> {
    return this.honorsService.findPublished();
  }
}

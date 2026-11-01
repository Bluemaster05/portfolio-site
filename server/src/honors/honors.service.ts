import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { ContentService } from '../common/content.service.js';
import { Honor } from './entities/honor.entity.js';

@Injectable()
export class HonorsService extends ContentService<Honor> {
  protected readonly entity = Honor;
  protected readonly label = 'Honor';
  // Manual order first; ties fall back to the most recent award first
  protected readonly orderBy: Record<string, 'asc' | 'desc'>[] = [
    { sortOrder: 'asc' },
    { date: 'desc' },
    { id: 'desc' },
  ];

  constructor(em: EntityManager) {
    super(em);
  }
}

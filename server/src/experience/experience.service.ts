import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { ContentService } from '../common/content.service.js';
import { Experience } from './entities/experience.entity.js';

@Injectable()
export class ExperienceService extends ContentService<Experience> {
  protected readonly entity = Experience;
  protected readonly label = 'Experience';
  // Manual order first; ties fall back to the most recent role first
  protected readonly orderBy: Record<string, 'asc' | 'desc'>[] = [
    { sortOrder: 'asc' },
    { startDate: 'desc' },
    { id: 'desc' },
  ];

  constructor(em: EntityManager) {
    super(em);
  }
}

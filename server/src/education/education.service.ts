import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { ContentService } from '../common/content.service.js';
import { Education } from './entities/education.entity.js';

@Injectable()
export class EducationService extends ContentService<Education> {
  protected readonly entity = Education;
  protected readonly label = 'Education entry';
  // Manual order first; ties fall back to the most recent graduation first
  protected readonly orderBy: Record<string, 'asc' | 'desc'>[] = [
    { sortOrder: 'asc' },
    { endDate: 'desc' },
    { id: 'desc' },
  ];

  constructor(em: EntityManager) {
    super(em);
  }
}

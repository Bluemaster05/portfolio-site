import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { ContentService } from '../common/content.service.js';
import { uniqueSlug } from '../common/utils/unique-slug.js';
import { featureOnly } from '../common/utils/feature-only.js';
import { Education } from './entities/education.entity.js';
import { CreateEducationDto, UpdateEducationDto } from './dto/education.dto.js';

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

  createEntry(data: CreateEducationDto): Promise<Education> {
    return this.create(data, (entry) => this.beforeFlush(entry));
  }

  updateEntry(id: number, data: UpdateEducationDto): Promise<Education> {
    return this.update(id, data, (entry) => this.beforeFlush(entry));
  }

  /** An empty slug becomes "degree-institution" (made unique); featuring this entry unfeatures any other. */
  private async beforeFlush(entry: Education): Promise<void> {
    if (!entry.slug) {
      entry.slug = await uniqueSlug(this.em, Education, `${entry.degree} ${entry.institution}`, entry, 'education');
    }
    await featureOnly(this.em, Education, entry);
  }
}

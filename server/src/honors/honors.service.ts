import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { ContentService } from '../common/content.service.js';
import { uniqueSlug } from '../common/utils/unique-slug.js';
import { featureOnly } from '../common/utils/feature-only.js';
import { Honor } from './entities/honor.entity.js';
import { CreateHonorDto, UpdateHonorDto } from './dto/honor.dto.js';

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

  createHonor(data: CreateHonorDto): Promise<Honor> {
    return this.create(data, (honor) => this.beforeFlush(honor));
  }

  updateHonor(id: number, data: UpdateHonorDto): Promise<Honor> {
    return this.update(id, data, (honor) => this.beforeFlush(honor));
  }

  /**
   * An empty slug becomes "title-issuer" (made unique), since titles like "Dean's List" repeat;
   * featuring this honor unfeatures any other.
   */
  private async beforeFlush(honor: Honor): Promise<void> {
    if (!honor.slug) {
      honor.slug = await uniqueSlug(this.em, Honor, `${honor.title} ${honor.issuer ?? ''}`, honor, 'honor');
    }
    await featureOnly(this.em, Honor, honor);
  }
}

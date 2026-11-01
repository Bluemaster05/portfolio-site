import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { ContentService } from '../common/content.service.js';
import { slugify } from '../common/utils/slugify.js';
import { Project } from './entities/project.entity.js';

@Injectable()
export class ProjectsService extends ContentService<Project> {
  protected readonly entity = Project;
  protected readonly label = 'Project';

  constructor(em: EntityManager) {
    super(em);
  }

  protected beforeSave(project: Project): void {
    if (!project.slug) project.slug = slugify(project.title);
  }
}

import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { ContentService } from '../common/content.service.js';
import { slugify } from '../common/utils/slugify.js';
import { TechnologiesService } from '../technologies/technologies.service.js';
import { Project } from './entities/project.entity.js';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto.js';
import { TechnologyUsageDto } from '../technologies/dto/technology.dto.js';

@Injectable()
export class ProjectsService extends ContentService<Project> {
  protected readonly entity = Project;
  protected readonly label = 'Project';
  protected readonly populate = ['technologies'];

  constructor(
    em: EntityManager,
    private readonly technologiesService: TechnologiesService,
  ) {
    super(em);
  }

  createProject({ technologyIds, ...data }: CreateProjectDto): Promise<Project> {
    return this.create(data, (project) => this.setTechnologies(project, technologyIds));
  }

  updateProject(id: number, { technologyIds, ...data }: UpdateProjectDto): Promise<Project> {
    return this.update(id, data, (project) => this.setTechnologies(project, technologyIds));
  }

  /** Technologies used by published projects, with counts, in the technologies' display order. */
  async technologyUsage(): Promise<TechnologyUsageDto[]> {
    const projects = await this.findPublished();
    const usage = new Map<number, TechnologyUsageDto & { sortOrder: number }>();
    for (const project of projects) {
      for (const technology of project.technologies) {
        const entry = usage.get(technology.id);
        if (entry) entry.projectCount += 1;
        else {
          const { id, name, slug, iconUrl, sortOrder } = technology;
          usage.set(id, { id, name, slug, iconUrl, sortOrder, projectCount: 1 });
        }
      }
    }
    return [...usage.values()]
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
      .map(({ sortOrder: _sortOrder, ...technology }) => technology);
  }

  protected beforeSave(project: Project): void {
    if (!project.slug) project.slug = slugify(project.title);
  }

  /** Replaces the project's technologies with these ids, keeping their order; undefined = keep. */
  private async setTechnologies(project: Project, ids: number[] | undefined): Promise<void> {
    if (ids === undefined) return;
    project.technologies.set(await this.technologiesService.findByIdsInOrder(ids));
  }
}

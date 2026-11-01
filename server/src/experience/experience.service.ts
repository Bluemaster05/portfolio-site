import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { ContentService } from '../common/content.service.js';
import { uniqueSlug } from '../common/utils/unique-slug.js';
import { featureOnly } from '../common/utils/feature-only.js';
import { TechnologiesService } from '../technologies/technologies.service.js';
import { EmployersService } from './employers.service.js';
import { Employer } from './entities/employer.entity.js';
import { Experience } from './entities/experience.entity.js';
import { CreateExperienceDto, ExperienceGroupDto, UpdateExperienceDto } from './dto/experience.dto.js';
import { toEmployerSummary, toExperienceSummary } from './experience.mapper.js';

@Injectable()
export class ExperienceService extends ContentService<Experience> {
  protected readonly entity = Experience;
  protected readonly label = 'Job';
  protected readonly populate = ['employer', 'technologies'];
  // Manual order first; ties fall back to the most recent role first
  protected readonly orderBy: Record<string, 'asc' | 'desc'>[] = [
    { sortOrder: 'asc' },
    { startDate: 'desc' },
    { id: 'desc' },
  ];

  constructor(
    em: EntityManager,
    private readonly technologiesService: TechnologiesService,
    private readonly employersService: EmployersService,
  ) {
    super(em);
  }

  createJob({ employerId, technologyIds, ...data }: CreateExperienceDto): Promise<Experience> {
    return this.create(data, (job) => this.applyRelations(job, employerId, technologyIds));
  }

  updateJob(id: number, { employerId, technologyIds, ...data }: UpdateExperienceDto): Promise<Experience> {
    return this.update(id, data, (job) => this.applyRelations(job, employerId, technologyIds));
  }

  /**
   * Published jobs grouped by employer, in the same order as the admin's grouped list: employers
   * as EmployersService.ordered(), jobs in the service's order (manual, then newest first).
   */
  async publishedByEmployer(featuredOnly = false): Promise<ExperienceGroupDto[]> {
    const jobs = await this.findPublished(featuredOnly ? { featured: true } : {});
    return (await this.employersService.ordered()).flatMap(({ employer }) => {
      const employerJobs = jobs.filter((job) => job.employer.id === employer.id);
      return employerJobs.length
        ? [{ employer: toEmployerSummary(employer), jobs: employerJobs.map(toExperienceSummary) }]
        : [];
    });
  }

  /** Sets what the plain data can't (undefined = keep), then fills in an empty slug. */
  private async applyRelations(job: Experience, employerId?: number, technologyIds?: number[]): Promise<void> {
    if (employerId !== undefined) {
      const employer = await this.em.findOne(Employer, employerId);
      if (!employer) throw new BadRequestException(`Unknown employer id: ${employerId}`);
      job.employer = employer;
    }
    if (technologyIds !== undefined) {
      job.technologies.set(await this.technologiesService.findByIdsInOrder(technologyIds));
    }
    if (!job.slug) job.slug = await uniqueSlug(this.em, Experience, `${job.role} ${job.employer.name}`, job, 'job');
    await featureOnly(this.em, Experience, job);
  }
}

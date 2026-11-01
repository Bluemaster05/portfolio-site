import { BadRequestException, Injectable } from '@nestjs/common';
import { FlushMode } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { ContentService } from '../common/content.service.js';
import { slugify } from '../common/utils/slugify.js';
import { TechnologiesService } from '../technologies/technologies.service.js';
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
   * Published jobs grouped by employer. Employers follow their manual order, then the most recent
   * first (a current job beats any ended one); jobs keep the service's order (manual, then newest).
   */
  async publishedByEmployer(): Promise<ExperienceGroupDto[]> {
    const groups = new Map<number, { employer: Employer; jobs: Experience[] }>();
    for (const job of await this.findPublished()) {
      const group = groups.get(job.employer.id);
      if (group) group.jobs.push(job);
      else groups.set(job.employer.id, { employer: job.employer, jobs: [job] });
    }
    // Partial dates ("2024", "2024-06") compare correctly as strings; "~" sorts after any of them
    const lastActive = (jobs: Experience[]) =>
      jobs.reduce((latest, job) => {
        const end = job.endDate ?? '~';
        return end > latest ? end : latest;
      }, '');
    return [...groups.values()]
      .sort(
        (a, b) =>
          a.employer.sortOrder - b.employer.sortOrder ||
          lastActive(b.jobs).localeCompare(lastActive(a.jobs)) ||
          a.employer.name.localeCompare(b.employer.name),
      )
      .map(({ employer, jobs }) => ({ employer: toEmployerSummary(employer), jobs: jobs.map(toExperienceSummary) }));
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
    if (!job.slug) job.slug = await this.uniqueSlug(job);
  }

  /** "role-employer", with -2, -3… if another job already uses it. */
  private async uniqueSlug(job: Experience): Promise<string> {
    const base = slugify(`${job.role} ${job.employer.name}`).slice(0, 110) || 'job';
    // COMMIT: don't auto-flush the job being created, which has no slug yet
    const others = await this.em.find(
      Experience,
      { slug: { $like: `${base}%` } },
      { fields: ['slug'], flushMode: FlushMode.COMMIT },
    );
    const taken = new Set(others.filter((other) => other !== job).map((other) => other.slug));
    let slug = base;
    for (let suffix = 2; taken.has(slug); suffix++) slug = `${base}-${suffix}`;
    return slug;
  }
}

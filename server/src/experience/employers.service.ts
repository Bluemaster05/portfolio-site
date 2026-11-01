import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UniqueConstraintViolationException } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { definedOnly } from '../common/utils/defined-only.js';
import { Employer } from './entities/employer.entity.js';
import { Experience } from './entities/experience.entity.js';
import { CreateEmployerDto, EmployerResponseDto, UpdateEmployerDto } from './dto/employer.dto.js';

@Injectable()
export class EmployersService {
  constructor(private readonly em: EntityManager) {}

  /** Every employer in display order, with how many jobs (drafts included) it has. */
  async findAll(): Promise<EmployerResponseDto[]> {
    return (await this.ordered()).map(({ employer, jobCount }) => toResponse(employer, jobCount));
  }

  /**
   * The one employer order used by the admin and the public experience page: manual order, then
   * an employer with a current job, then the most recently active. Drafts count, so both agree.
   */
  async ordered(): Promise<{ employer: Employer; jobCount: number }[]> {
    const employers = await this.em.find(Employer, {});
    const jobs = await this.em.find(Experience, {}, { fields: ['employer', 'endDate'] });
    const stats = new Map<number, { jobCount: number; lastActive: string }>();
    for (const job of jobs) {
      const entry = stats.get(job.employer.id) ?? { jobCount: 0, lastActive: '' };
      // Partial dates ("2024", "2024-06") compare correctly as strings; "~" sorts after any of them
      const end = job.endDate ?? '~';
      stats.set(job.employer.id, { jobCount: entry.jobCount + 1, lastActive: end > entry.lastActive ? end : entry.lastActive });
    }
    const statsOf = (employer: Employer) => stats.get(employer.id) ?? { jobCount: 0, lastActive: '' };
    return employers
      .sort(
        (a, b) =>
          a.sortOrder - b.sortOrder ||
          // Plain comparison: localeCompare would sort "~" before digits
          compare(statsOf(b).lastActive, statsOf(a).lastActive) ||
          a.name.localeCompare(b.name),
      )
      .map((employer) => ({ employer, jobCount: statsOf(employer).jobCount }));
  }

  async create(dto: CreateEmployerDto): Promise<EmployerResponseDto> {
    const name = await this.assertNameFree(dto.name.trim());
    const employer = this.em.create(Employer, { ...definedOnly(dto), name });
    await this.flush();
    return toResponse(employer, 0);
  }

  async update(id: number, dto: UpdateEmployerDto): Promise<EmployerResponseDto> {
    const employer = await this.findOne(id);
    const { name: rawName, ...rest } = dto;
    Object.assign(employer, definedOnly(rest));
    const name = rawName?.trim();
    if (name && name !== employer.name) employer.name = await this.assertNameFree(name, id);
    await this.flush();
    return toResponse(employer, await this.em.count(Experience, { employer: id }));
  }

  /** Only employers without jobs can go, so no job is left without one. */
  async remove(id: number): Promise<void> {
    const employer = await this.findOne(id);
    const jobs = await this.em.count(Experience, { employer: id });
    if (jobs > 0) {
      throw new ConflictException(`${employer.name} still has ${jobs} job${jobs === 1 ? '' : 's'}; move or delete them first`);
    }
    await this.em.remove(employer).flush();
  }

  /** Gives the listed employers sortOrder 0, 1, 2… in the order given. */
  async reorder(ids: number[]): Promise<EmployerResponseDto[]> {
    const employers = await this.em.find(Employer, { id: { $in: ids } });
    const position = new Map(ids.map((id, index) => [id, index]));
    for (const employer of employers) {
      employer.sortOrder = position.get(employer.id) ?? employer.sortOrder;
    }
    await this.em.flush();
    return this.findAll();
  }

  private async findOne(id: number): Promise<Employer> {
    const employer = await this.em.findOne(Employer, id);
    if (!employer) throw new NotFoundException('Employer not found');
    return employer;
  }

  /** Names are unique ignoring case, so "acme" can't sit next to "Acme". Returns the name. */
  private async assertNameFree(name: string, exceptId?: number): Promise<string> {
    const existing = (await this.em.find(Employer, {})).find(
      (other) => other.id !== exceptId && other.name.toLowerCase() === name.toLowerCase(),
    );
    if (existing) throw new ConflictException(`An employer named "${existing.name}" already exists`);
    return name;
  }

  private async flush() {
    try {
      await this.em.flush();
    } catch (error) {
      if (error instanceof UniqueConstraintViolationException) {
        throw new ConflictException('An employer with that name already exists');
      }
      throw error;
    }
  }
}

function compare(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function toResponse(employer: Employer, jobCount: number): EmployerResponseDto {
  const { id, name, url, logoUrl, sortOrder, createdAt, updatedAt } = employer;
  return { id, name, url, logoUrl, sortOrder, jobCount, createdAt, updatedAt };
}

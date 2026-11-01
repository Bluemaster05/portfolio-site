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

  /** Every employer with how many jobs (drafts included) it has. */
  async findAll(): Promise<EmployerResponseDto[]> {
    const employers = await this.em.find(Employer, {}, { orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] });
    const jobs = await this.em.find(Experience, {}, { fields: ['employer'] });
    const counts = new Map<number, number>();
    for (const job of jobs) counts.set(job.employer.id, (counts.get(job.employer.id) ?? 0) + 1);
    return employers.map((employer) => toResponse(employer, counts.get(employer.id) ?? 0));
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

function toResponse(employer: Employer, jobCount: number): EmployerResponseDto {
  const { id, name, url, logoUrl, sortOrder, createdAt, updatedAt } = employer;
  return { id, name, url, logoUrl, sortOrder, jobCount, createdAt, updatedAt };
}

import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UniqueConstraintViolationException } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { Technology } from './entities/technology.entity.js';
import { CreateTechnologyDto, UpdateTechnologyDto } from './dto/technology.dto.js';
import { definedOnly } from '../common/utils/defined-only.js';
import { technologySlug } from './technology-slug.js';

@Injectable()
export class TechnologiesService {
  constructor(private readonly em: EntityManager) {}

  findAll(): Promise<Technology[]> {
    return this.em.find(Technology, {}, { orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] });
  }

  async findOne(id: number): Promise<Technology> {
    const technology = await this.em.findOne(Technology, id);
    if (!technology) throw new NotFoundException('Technology not found');
    return technology;
  }

  async create(dto: CreateTechnologyDto): Promise<Technology> {
    const name = dto.name.trim();
    const others = await this.findAll();
    const technology = this.em.create(Technology, {
      ...definedOnly(dto),
      name: assertNameFree(name, others),
      slug: uniqueSlug(name, others),
    });
    await this.flush();
    return technology;
  }

  async update(id: number, dto: UpdateTechnologyDto): Promise<Technology> {
    const technology = await this.findOne(id);
    const { name: rawName, ...rest } = dto;
    Object.assign(technology, definedOnly(rest));
    const name = rawName?.trim();
    if (name && name !== technology.name) {
      const others = (await this.findAll()).filter((other) => other.id !== id);
      technology.name = assertNameFree(name, others);
      technology.slug = uniqueSlug(name, others);
    }
    await this.flush();
    return technology;
  }

  /** Projects using the technology simply lose it. */
  async remove(id: number): Promise<void> {
    await this.em.remove(await this.findOne(id)).flush();
  }

  /** Gives the listed technologies sortOrder 0, 1, 2… in the order given. */
  async reorder(ids: number[]): Promise<Technology[]> {
    const technologies = await this.em.find(Technology, { id: { $in: ids } });
    const position = new Map(ids.map((id, index) => [id, index]));
    for (const technology of technologies) {
      technology.sortOrder = position.get(technology.id) ?? technology.sortOrder;
    }
    await this.em.flush();
    return this.findAll();
  }

  /** The technologies with these ids, in the order given; unknown ids are an error. */
  async findByIdsInOrder(ids: number[]): Promise<Technology[]> {
    const unique = [...new Set(ids)];
    const found = await this.em.find(Technology, { id: { $in: unique } });
    const byId = new Map(found.map((technology) => [technology.id, technology]));
    const missing = unique.filter((id) => !byId.has(id));
    if (missing.length) throw new BadRequestException(`Unknown technology id(s): ${missing.join(', ')}`);
    return unique.map((id) => byId.get(id)).filter((technology) => technology !== undefined);
  }

  private async flush() {
    try {
      await this.em.flush();
    } catch (error) {
      if (error instanceof UniqueConstraintViolationException) {
        throw new ConflictException('A technology with that name already exists');
      }
      throw error;
    }
  }
}

/** Names are unique ignoring case, so "react" can't sit next to "React". Returns the name. */
function assertNameFree(name: string, others: Technology[]): string {
  const existing = others.find((other) => other.name.toLowerCase() === name.toLowerCase());
  if (existing) throw new ConflictException(`A technology named "${existing.name}" already exists`);
  return name;
}

/** The name's slug, with -2, -3… added if another technology already uses it. */
function uniqueSlug(name: string, others: Technology[]): string {
  const base = technologySlug(name);
  if (!base) throw new BadRequestException('The name needs at least one letter or number');
  const taken = new Set(others.map((other) => other.slug));
  let slug = base;
  for (let suffix = 2; taken.has(slug); suffix++) slug = `${base}-${suffix}`;
  return slug;
}

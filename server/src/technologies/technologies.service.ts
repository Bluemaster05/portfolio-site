import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { UniqueConstraintViolationException } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { Technology } from './entities/technology.entity.js';
import { CreateTechnologyDto, UpdateTechnologyDto } from './dto/technology.dto.js';
import { definedOnly } from '../common/utils/defined-only.js';
import { slugify } from '../common/utils/slugify.js';

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
    const technology = this.em.create(Technology, { ...definedOnly(dto), name: dto.name.trim(), slug: slugOf(dto.name) });
    await this.flush();
    return technology;
  }

  async update(id: number, dto: UpdateTechnologyDto): Promise<Technology> {
    const technology = await this.findOne(id);
    Object.assign(technology, definedOnly(dto));
    if (dto.name) {
      technology.name = dto.name.trim();
      technology.slug = slugOf(dto.name);
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

function slugOf(name: string): string {
  const slug = slugify(name);
  if (!slug) throw new BadRequestException('The name needs at least one letter or number');
  return slug;
}

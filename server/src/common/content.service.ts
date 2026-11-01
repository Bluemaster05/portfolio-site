import { ConflictException, NotFoundException } from '@nestjs/common';
import {
  UniqueConstraintViolationException,
  type FilterQuery,
  type QueryOrderMap,
} from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { ContentItem } from './entities/content-item.entity.js';
import { definedOnly } from './utils/defined-only.js';

/**
 * MikroORM cannot check a query against an unresolved generic entity type. Queries built here only
 * use ContentItem columns, which every subclass has, so widening them to T is safe.
 */
function forEntity<T extends ContentItem>(query: FilterQuery<ContentItem>): FilterQuery<T> {
  return query as unknown as FilterQuery<T>;
}

/**
 * CRUD shared by every content module. Subclasses set the entity, a label for error messages,
 * and optionally the ordering and a hook that runs before each save.
 */
export abstract class ContentService<T extends ContentItem> {
  protected abstract readonly entity: new () => T;
  protected abstract readonly label: string;

  /** Column -> direction, applied in turn; columns must exist on the entity */
  protected readonly orderBy: Record<string, 'asc' | 'desc'>[] = [{ sortOrder: 'asc' }, { id: 'desc' }];

  constructor(protected readonly em: EntityManager) {}

  private get order(): QueryOrderMap<T>[] {
    return this.orderBy as unknown as QueryOrderMap<T>[];
  }

  /** Every item, drafts included, for the admin portal. */
  findAll(): Promise<T[]> {
    return this.em.find(this.entity, {}, { orderBy: this.order });
  }

  /** Published items in display order, for the public site. */
  findPublished(where: FilterQuery<T> = {}): Promise<T[]> {
    return this.em.find(
      this.entity,
      { $and: [where, forEntity<T>({ published: true })] },
      { orderBy: this.order },
    );
  }

  async findPublishedOne(where: FilterQuery<T>): Promise<T> {
    const item = await this.em.findOne(this.entity, {
      $and: [where, forEntity<T>({ published: true })],
    });
    if (!item) throw new NotFoundException(`${this.label} not found`);
    return item;
  }

  async findOne(id: number): Promise<T> {
    const item = await this.em.findOne(this.entity, forEntity<T>({ id }));
    if (!item) throw new NotFoundException(`${this.label} not found`);
    return item;
  }

  async create(data: Partial<T>): Promise<T> {
    const item = Object.assign(new this.entity(), definedOnly(data));
    this.beforeSave(item);
    this.em.persist(item);
    await this.flush();
    return item;
  }

  async update(id: number, data: Partial<T>): Promise<T> {
    const item = await this.findOne(id);
    Object.assign(item, definedOnly(data));
    this.beforeSave(item);
    await this.flush();
    return item;
  }

  async remove(id: number): Promise<void> {
    const item = await this.findOne(id);
    await this.em.remove(item).flush();
  }

  /** Gives the listed items sortOrder 0, 1, 2… in the order given. */
  async reorder(ids: number[]): Promise<T[]> {
    const items = await this.em.find(this.entity, forEntity<T>({ id: { $in: ids } }));
    const position = new Map(ids.map((id, index) => [id, index]));
    for (const item of items) {
      item.sortOrder = position.get(item.id) ?? item.sortOrder;
    }
    await this.flush();
    return this.findAll();
  }

  /** Runs after create/update data is applied and before the flush. */
  protected beforeSave(_item: T): void {}

  private async flush() {
    try {
      await this.em.flush();
    } catch (error) {
      if (error instanceof UniqueConstraintViolationException) {
        throw new ConflictException(`A ${this.label.toLowerCase()} with that slug already exists`);
      }
      throw error;
    }
  }
}

import { type Opt } from '@mikro-orm/core';
import { Entity, Enum, PrimaryKey, Property, Unique } from '@mikro-orm/decorators/legacy';
import { ApiScope } from '../api-scope.enum.js';

/** A read-only token the public site uses to fetch content. */
@Entity()
export class ApiToken {
  @PrimaryKey()
  id!: number;

  @Property({ length: 100 })
  name!: string;

  /** First characters of the token, shown so admins can tell tokens apart */
  @Property({ length: 16 })
  prefix!: string;

  /** SHA-256 of the full token */
  @Unique()
  @Property({ length: 64, hidden: true })
  tokenHash!: string;

  @Enum({ items: () => ApiScope, array: true })
  scopes!: ApiScope[];

  @Property({ nullable: true })
  expiresAt?: Date;

  @Property({ nullable: true })
  lastUsedAt?: Date;

  @Property({ nullable: true })
  revokedAt?: Date;

  @Property({ onCreate: () => new Date() })
  createdAt: Date & Opt = new Date();
}

import { type Opt, type Rel } from '@mikro-orm/core';
import { Entity, Index, ManyToOne, PrimaryKey, Property } from '@mikro-orm/decorators/legacy';
import { User } from '../../users/entities/user.entity.js';

@Entity()
export class RefreshToken {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => User, { deleteRule: 'cascade' })
  user!: Rel<User>;

  /** SHA-256 of the raw token; the raw value only lives in the cookie */
  @Index()
  @Property({ length: 64 })
  tokenHash!: string;

  @Property()
  expiresAt!: Date;

  @Property({ nullable: true })
  revokedAt?: Date;

  @Property({ onCreate: () => new Date() })
  createdAt: Date & Opt = new Date();
}

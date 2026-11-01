import { type Opt } from '@mikro-orm/core';
import { Entity, PrimaryKey, Property, Unique } from '@mikro-orm/decorators/legacy';

/** An admin who can sign in to the admin portal. */
@Entity()
export class User {
  @PrimaryKey()
  id!: number;

  @Unique()
  @Property({ length: 320 })
  email!: string;

  @Property({ length: 100 })
  name!: string;

  @Property({ hidden: true })
  passwordHash!: string;

  @Property({ onCreate: () => new Date() })
  createdAt: Date & Opt = new Date();

  @Property({ nullable: true })
  lastLoginAt?: Date;
}

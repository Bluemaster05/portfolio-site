import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { hash } from 'argon2';
import { User } from './entities/user.entity.js';

@Injectable()
export class UsersService {
  constructor(private readonly em: EntityManager) {}

  findById(id: number) {
    return this.em.findOne(User, id);
  }

  findByEmail(email: string) {
    return this.em.findOne(User, { email: email.trim().toLowerCase() });
  }

  async create(email: string, name: string, password: string) {
    const user = this.em.create(User, {
      email: email.trim().toLowerCase(),
      name,
      passwordHash: await hash(password),
    });
    await this.em.flush();
    return user;
  }
}

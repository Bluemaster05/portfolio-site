import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { ApiToken } from './entities/api-token.entity.js';
import { ApiScope } from './api-scope.enum.js';
import { hashToken, randomToken } from '../common/utils/hash-token.js';
import { CreateApiTokenDto } from './dto/create-api-token.dto.js';

/** How often lastUsedAt is written, so busy sites don't update the row on every request. */
const LAST_USED_RESOLUTION_MS = 60 * 1000;

@Injectable()
export class ApiTokensService {
  constructor(private readonly em: EntityManager) {}

  findAll() {
    return this.em.find(ApiToken, {}, { orderBy: { createdAt: 'desc' } });
  }

  /** Creates a token and returns it with the raw value, which is never retrievable again. */
  async create(dto: CreateApiTokenDto, rawToken = `pk_${randomToken(24)}`) {
    const token = this.em.create(ApiToken, {
      name: dto.name,
      scopes: [...new Set(dto.scopes)],
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : undefined,
      prefix: rawToken.slice(0, 10),
      tokenHash: hashToken(rawToken),
    });
    await this.em.flush();
    return { token, rawToken };
  }

  async revoke(id: number) {
    const token = await this.em.findOne(ApiToken, id);
    if (!token) throw new NotFoundException('API token not found');
    token.revokedAt ??= new Date();
    await this.em.flush();
    return token;
  }

  async remove(id: number) {
    const deleted = await this.em.nativeDelete(ApiToken, id);
    if (!deleted) throw new NotFoundException('API token not found');
  }

  /** The active token matching `rawToken` that has `scope`, or null. */
  async verify(rawToken: string, scope: ApiScope): Promise<ApiToken | null> {
    const token = await this.em.findOne(ApiToken, { tokenHash: hashToken(rawToken) });
    const now = new Date();
    if (!token || token.revokedAt || (token.expiresAt && token.expiresAt <= now)) return null;
    if (!token.scopes.includes(scope)) return null;

    if (!token.lastUsedAt || now.getTime() - token.lastUsedAt.getTime() > LAST_USED_RESOLUTION_MS) {
      await this.em.nativeUpdate(ApiToken, token.id, { lastUsedAt: now });
    }
    return token;
  }
}

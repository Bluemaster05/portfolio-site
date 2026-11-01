import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EntityManager } from '@mikro-orm/postgresql';
import { verify } from 'argon2';
import { UsersService } from '../users/users.service.js';
import { User } from '../users/entities/user.entity.js';
import { RefreshToken } from './entities/refresh-token.entity.js';
import { hashToken, randomToken } from '../common/utils/hash-token.js';

export const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;
export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly em: EntityManager,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findByEmail(email);
    // One message for both cases so the response does not reveal which emails exist
    if (!user || !(await verify(user.passwordHash, password))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    user.lastLoginAt = new Date();
    await this.em.flush();
    return user;
  }

  async issueTokens(user: User): Promise<IssuedTokens> {
    const accessToken = await this.jwtService.signAsync(
      { sub: user.id, email: user.email },
      { expiresIn: ACCESS_TOKEN_TTL_MS / 1000 },
    );
    const refreshToken = randomToken();
    this.em.create(RefreshToken, {
      user,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    });
    await this.em.flush();
    return { accessToken, refreshToken };
  }

  /** Swaps a valid refresh token for a new pair; the old refresh token stops working. */
  async refresh(rawRefreshToken: string): Promise<IssuedTokens> {
    const stored = await this.em.findOne(
      RefreshToken,
      { tokenHash: hashToken(rawRefreshToken) },
      { populate: ['user'] },
    );
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token is invalid or expired');
    }
    stored.revokedAt = new Date();
    return this.issueTokens(stored.user);
  }

  async revoke(rawRefreshToken: string): Promise<void> {
    await this.em.nativeUpdate(
      RefreshToken,
      { tokenHash: hashToken(rawRefreshToken), revokedAt: null },
      { revokedAt: new Date() },
    );
  }
}

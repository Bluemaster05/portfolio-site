import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { CookieOptions, Request, Response } from 'express';
import {
  ACCESS_TOKEN_TTL_MS,
  AuthService,
  REFRESH_TOKEN_TTL_MS,
  type IssuedTokens,
} from './auth.service.js';
import { UsersService } from '../users/users.service.js';
import { Public } from '../common/decorators/public.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { JwtPayload } from '../common/types/jwt-payload.js';
import { ErrorResponseDto } from '../common/dto/error-response.dto.js';
import { MessageResponseDto } from '../common/dto/message-response.dto.js';
import { UserResponseDto } from '../users/dto/user-response.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { CsrfTokenResponseDto } from './dto/csrf-token-response.dto.js';
import { generateCsrfToken } from './csrf.js';

const baseCookie: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
};

function setAuthCookies(res: Response, tokens: IssuedTokens) {
  res.cookie('access_token', tokens.accessToken, {
    ...baseCookie,
    maxAge: ACCESS_TOKEN_TTL_MS,
  });
  res.cookie('refresh_token', tokens.refreshToken, {
    ...baseCookie,
    maxAge: REFRESH_TOKEN_TTL_MS,
  });
}

function clearAuthCookies(res: Response) {
  res.clearCookie('access_token', baseCookie);
  res.clearCookie('refresh_token', baseCookie);
}

function readRefreshCookie(req: Request): string | undefined {
  const value: unknown = req.cookies?.['refresh_token'];
  return typeof value === 'string' ? value : undefined;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Sign in as an admin; sets access and refresh cookies' })
  @ApiOkResponse({ type: MessageResponseDto })
  @ApiUnauthorizedResponse({ description: 'Wrong email or password', type: ErrorResponseDto })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<MessageResponseDto> {
    const user = await this.authService.validateUser(dto.email, dto.password);
    setAuthCookies(res, await this.authService.issueTokens(user));
    return { message: 'Signed in' };
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  @ApiCookieAuth('refresh_token')
  @ApiOperation({ summary: 'Rotate the refresh cookie and issue a new access cookie' })
  @ApiOkResponse({ type: MessageResponseDto })
  @ApiUnauthorizedResponse({
    description: 'Missing, expired or revoked refresh token',
    type: ErrorResponseDto,
  })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<MessageResponseDto> {
    const raw = readRefreshCookie(req);
    if (!raw) throw new UnauthorizedException('No refresh token provided');
    try {
      setAuthCookies(res, await this.authService.refresh(raw));
    } catch (error) {
      clearAuthCookies(res);
      throw error;
    }
    return { message: 'Token refreshed' };
  }

  @Public()
  @Post('logout')
  @HttpCode(200)
  @ApiOperation({ summary: 'Sign out; revokes the refresh token and clears cookies' })
  @ApiOkResponse({ type: MessageResponseDto })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<MessageResponseDto> {
    const raw = readRefreshCookie(req);
    if (raw) await this.authService.revoke(raw);
    clearAuthCookies(res);
    return { message: 'Signed out' };
  }

  @Get('me')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'The signed-in admin' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto })
  async me(@CurrentUser() current: JwtPayload): Promise<UserResponseDto> {
    const user = await this.usersService.findById(current.id);
    if (!user) throw new NotFoundException('User no longer exists');
    return user;
  }

  @Public()
  @Get('csrf-token')
  @ApiOperation({ summary: 'Get a CSRF token for the X-CSRF-Token header' })
  @ApiOkResponse({ type: CsrfTokenResponseDto })
  csrfToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): CsrfTokenResponseDto {
    return { token: generateCsrfToken(req, res) };
  }
}

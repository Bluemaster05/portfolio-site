import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule, type OpenAPIObject } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { doubleCsrfProtection } from './auth/csrf.js';
import { adminNetworkMiddleware } from './common/middleware/admin-network.middleware.js';

/** Middleware, validation and the /api prefix — shared by main.ts and tests. */
export function configureApp(app: INestApplication) {
  // Before anything else, so blocked admin requests look like any unknown route
  app.use(adminNetworkMiddleware);
  app.use(cookieParser());
  app.use(helmet());
  app.enableCors({
    // Comma-separated list of browser origins allowed to send credentialed requests
    origin: (process.env.CORS_ORIGIN ?? 'http://localhost:3000').split(',').map((o) => o.trim()),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });
  // csrf-csrf skips GET/HEAD/OPTIONS, so the token-authenticated public API is unaffected
  app.use(doubleCsrfProtection);
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.setGlobalPrefix('api');
}

export function createOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('Portfolio API')
    .setDescription(
      'Content API for the portfolio site.\n\n' +
        '- `/api/public/*` — read-only, published content. Authenticate with an API token in ' +
        '`X-API-Key` (or `Authorization: Bearer`).\n' +
        '- `/api/admin/*` — content management. Authenticate by signing in through `/api/auth/login` ' +
        '(httpOnly cookies) and send `X-CSRF-Token` from `/api/auth/csrf-token` on every non-GET request.',
    )
    .setVersion('1.0')
    .addCookieAuth('access_token', { type: 'apiKey', in: 'cookie', name: 'access_token' }, 'access_token')
    .addCookieAuth('refresh_token', { type: 'apiKey', in: 'cookie', name: 'refresh_token' }, 'refresh_token')
    .addApiKey({ type: 'apiKey', in: 'header', name: 'X-API-Key' }, 'api-key')
    .build();
  return SwaggerModule.createDocument(app, config);
}

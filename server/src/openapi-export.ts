/**
 * Writes openapi.json without listening or touching the database (MikroORM connects lazily).
 * Run with `yarn openapi:export`; the frontend generates its API types from the file.
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { NestFactory } from '@nestjs/core';

// Placeholders so config lookups succeed; nothing is signed or verified during export
process.env.JWT_SECRET ??= 'openapi-export';
process.env.CSRF_SECRET ??= 'openapi-export';
process.env.DB_NAME ??= 'openapi-export';

const { AppModule } = await import('./app.module.js');
const { configureApp, createOpenApiDocument } = await import('./app.setup.js');

const app = await NestFactory.create(AppModule, { logger: ['error', 'warn'] });
configureApp(app);
await app.init();

const outFile = resolve(process.cwd(), 'openapi.json');
writeFileSync(outFile, `${JSON.stringify(createOpenApiDocument(app), null, 2)}\n`);
await app.close();
console.log(`OpenAPI document written to ${outFile}`);

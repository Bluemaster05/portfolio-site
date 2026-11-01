import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { configureApp, createOpenApiDocument } from './app.setup.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);

  // API docs are for development; production doesn't publish them
  if (process.env.NODE_ENV !== 'production') {
    SwaggerModule.setup('api/docs', app, () => createOpenApiDocument(app), {
      jsonDocumentUrl: 'api/docs-json',
    });
  }

  await app.listen(process.env.PORT ?? 4000);
}
await bootstrap();

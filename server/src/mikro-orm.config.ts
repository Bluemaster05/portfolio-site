import 'dotenv/config';
import { defineConfig } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';
import { SeedManager } from '@mikro-orm/seeder';
import { ReflectMetadataProvider } from '@mikro-orm/decorators/legacy';
import { User } from './users/entities/user.entity.js';
import { RefreshToken } from './auth/entities/refresh-token.entity.js';
import { ApiToken } from './api-tokens/entities/api-token.entity.js';
import { SiteSettings } from './site/entities/site-settings.entity.js';
import { Project } from './projects/entities/project.entity.js';
import { Experience } from './experience/entities/experience.entity.js';
import { Education } from './education/entities/education.entity.js';
import { Honor } from './honors/entities/honor.entity.js';
import { BlogPost } from './blog/entities/blog-post.entity.js';
import { MediaAsset } from './media/entities/media-asset.entity.js';
import { Technology } from './technologies/entities/technology.entity.js';

export default defineConfig({
  metadataProvider: ReflectMetadataProvider,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  dbName: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  entities: [
    User,
    RefreshToken,
    ApiToken,
    SiteSettings,
    Project,
    Experience,
    Education,
    Honor,
    BlogPost,
    MediaAsset,
    Technology,
  ],
  extensions: [Migrator, SeedManager],
  migrations: {
    // Compiled migrations for `node dist/...`, sources when the CLI runs through a TS loader
    path: 'dist/migrations',
    pathTs: 'src/migrations',
  },
  seeder: {
    path: 'dist/seeders',
    pathTs: 'src/seeders',
    defaultSeeder: 'DatabaseSeeder',
  },
  // Logs every query, so only in development
  debug: process.env.NODE_ENV === 'development',
});

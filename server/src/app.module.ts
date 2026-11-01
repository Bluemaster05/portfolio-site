import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import mikroOrmConfig from './mikro-orm.config.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { ApiTokensModule } from './api-tokens/api-tokens.module.js';
import { SiteModule } from './site/site.module.js';
import { ProjectsModule } from './projects/projects.module.js';
import { ExperienceModule } from './experience/experience.module.js';
import { EducationModule } from './education/education.module.js';
import { HonorsModule } from './honors/honors.module.js';
import { BlogModule } from './blog/blog.module.js';
import { MediaModule } from './media/media.module.js';
import { TechnologiesModule } from './technologies/technologies.module.js';
import { HealthController } from './health/health.controller.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MikroOrmModule.forRoot(mikroOrmConfig),
    AuthModule,
    UsersModule,
    ApiTokensModule,
    SiteModule,
    ProjectsModule,
    ExperienceModule,
    EducationModule,
    HonorsModule,
    BlogModule,
    MediaModule,
    TechnologiesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}

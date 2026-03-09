import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import config from './config/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { DepartmentModule } from './department/department.module';
import { FilesModule } from './files/files.module';
import { UsersModule } from './users/users.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { NewsModule } from './news/news.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['src/config/.env.development.local'],
      load: [config],
      expandVariables: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    DatabaseModule,
    AuthModule,
    DepartmentModule,
    FilesModule,
    UsersModule,
    NewsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

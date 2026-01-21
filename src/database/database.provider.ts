import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import { Provider } from '@nestjs/common';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';

export type DrizzleDatabase = NodePgDatabase<typeof schema>;

export const DatabaseProviders: Provider[] = [
  {
    provide: 'DRIZZLE',
    useFactory: (config: ConfigService): DrizzleDatabase => {
      const pool = new Pool({
        host: config.get<string>('database.host'),
        port: Number(config.get<string>('database.port')),
        user: config.get<string>('database.user'),
        password: config.get<string>('database.pass'),
        database: config.get<string>('database.name'),
      });
      return drizzle(pool, { schema });
    },
    inject: [ConfigService],
  },
];

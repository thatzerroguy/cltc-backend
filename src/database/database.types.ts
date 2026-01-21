import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

export type DrizzleDatabase = ReturnType<typeof drizzle<typeof schema>>;

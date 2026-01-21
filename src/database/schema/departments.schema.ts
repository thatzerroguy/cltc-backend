import { sql } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const departmentSchema = pgTable('departments', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  name: text('name').notNull().unique(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

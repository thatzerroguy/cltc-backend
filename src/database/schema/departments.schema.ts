import { relations, sql } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { userSchema } from './user.schema';
import { workFlowSchema } from './workflow.schema';
import { fileSchema } from './file.schema';

export const departmentSchema = pgTable('departments', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  name: text('name').notNull().unique(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const departmentRelations = relations(departmentSchema, ({ many }) => ({
  users: many(userSchema),
  workflowSteps: many(workFlowSchema),
  originFiles: many(fileSchema, { relationName: 'originFiles' }),
  currentFiles: many(fileSchema, { relationName: 'currentFiles' }),
}));

import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { fileSchema } from './file.schema';
import { departmentSchema } from './departments.schema';
import { relations } from 'drizzle-orm';

export const statusEnum = pgEnum('step_status', [
  'pending',
  'approved',
  'returned',
]);

export const workFlowSchema = pgTable('workflows', {
  id: uuid('id').primaryKey().defaultRandom(),

  file_id: uuid('file_id').references(() => fileSchema.id),

  department_id: uuid('department_id').references(() => departmentSchema.id),
  status: statusEnum('status').notNull().default('pending'),
  step_order: integer('step_order').notNull(),
  comments: text('comments'),
  completed_at: timestamp('completed_at'),
});

export const workflowRelations = relations(workFlowSchema, ({ one }) => ({
  file: one(fileSchema, {
    fields: [workFlowSchema.file_id],

    references: [fileSchema.id],
  }),

  department: one(departmentSchema, {
    fields: [workFlowSchema.department_id],

    references: [departmentSchema.id],
  }),
}));

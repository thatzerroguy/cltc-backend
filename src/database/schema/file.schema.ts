import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { departmentSchema } from './departments.schema';
import { userSchema } from './user.schema';
import { workFlowSchema } from './workflow.schema';
import { relations } from 'drizzle-orm';
import { fileLogSchema } from './file-log.schema';

export const fileStatusEnum = pgEnum('file_status', [
  'draft',
  'in_circulation',
  'completed',
  'rejected',
  'forwarded',
]);

export const fileSchema = pgTable('files', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  creator_id: uuid('creator_id')
    .references(() => userSchema.id)
    .notNull(),
  origin_department_id: uuid('origin_department_id').references(
    () => departmentSchema.id,
  ),
  file_url: text('file_url').notNull(),
  status: fileStatusEnum('status').default('draft'),
  current_department_id: uuid('current_department_id')
    .references(() => departmentSchema.id)
    .notNull(),
  current_step_id: uuid('current_step_id').references(() => workFlowSchema.id),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

export const fileRelations = relations(fileSchema, ({ one, many }) => ({
  creator: one(userSchema, {
    fields: [fileSchema.creator_id],

    references: [userSchema.id],
  }),

  originDepartment: one(departmentSchema, {
    fields: [fileSchema.origin_department_id],

    references: [departmentSchema.id],
    relationName: 'originFiles',
  }),

  currentDepartment: one(departmentSchema, {
    fields: [fileSchema.current_department_id],

    references: [departmentSchema.id],
    relationName: 'currentFiles',
  }),
  workflowSteps: many(workFlowSchema),
  logs: many(fileLogSchema),
}));

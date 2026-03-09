import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { fileSchema } from './file.schema';
import { userSchema } from './user.schema';
import { departmentSchema } from './departments.schema';
import { relations } from 'drizzle-orm';

export const fileLogSchema = pgTable('file_logs', {
  id: uuid('id').primaryKey().defaultRandom(),

  user_id: uuid('user_id').references(() => userSchema.id),

  file_id: uuid('file_id').references(() => fileSchema.id),

  from_department_id: uuid('from_department_id').references(
    () => departmentSchema.id,
  ),

  to_department_id: uuid('to_department_id').references(
    () => departmentSchema.id,
  ),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
});

export const fileLogRelations = relations(fileLogSchema, ({ one }) => ({
  file: one(fileSchema, {
    fields: [fileLogSchema.file_id],

    references: [fileSchema.id],
  }),

  user: one(userSchema, {
    fields: [fileLogSchema.user_id],

    references: [userSchema.id],
  }),

  fromDepartment: one(departmentSchema, {
    fields: [fileLogSchema.from_department_id],

    references: [departmentSchema.id],
  }),

  toDepartment: one(departmentSchema, {
    fields: [fileLogSchema.to_department_id],

    references: [departmentSchema.id],
  }),
}));

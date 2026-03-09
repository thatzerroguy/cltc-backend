import { relations, sql } from 'drizzle-orm';
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { profileSchema } from './profile.schema';
import { departmentSchema } from './departments.schema';
import { fileSchema } from './file.schema';

// Using text for flexibility, validation is handled at DTO level
// export const roleEnum = pgEnum('role', ['super_admin', 'admin']);
// export const departmentEnum = pgEnum('department', ['ict', 'dg', 'hr']);
// export const subRoleEnum = pgEnum('sub_role', ['head', 'manager', 'employee']);

export const userSchema = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  role: text('role').default('STAFF').notNull(),
  department: text('department').default('ICT').notNull(),
  department_id: uuid('department_id').references(() => departmentSchema.id),
  sub_role: text('sub_role').default('employee').notNull(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at')
    .$onUpdate(() => sql`now()`)
    .notNull(),
});

export const userRelations = relations(userSchema, ({ one, many }) => ({
  profile: one(profileSchema, {
    fields: [userSchema.id],
    references: [profileSchema.user_id],
  }),
  department: one(departmentSchema, {
    fields: [userSchema.department_id],
    references: [departmentSchema.id],
  }),
  files: many(fileSchema),
}));

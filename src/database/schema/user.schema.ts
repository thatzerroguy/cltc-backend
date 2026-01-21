import { relations, sql } from 'drizzle-orm';
import { pgEnum, pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { profileSchema } from './profile.schema';

export const roleEnum = pgEnum('role', ['super_admin', 'admin']);

export const departmentEnum = pgEnum('department', ['ict', 'dg', 'hr']);

export const userSchema = pgTable('users', {
  id: uuid('id')
    .default(sql`gen_random_uuid()`)
    .primaryKey(),
  role: roleEnum('role').default('admin').notNull(),
  department: departmentEnum('department').default('ict').notNull(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at')
    .$onUpdate(() => sql`now()`)
    .notNull(),
});

export const userRelations = relations(userSchema, ({ one }) => ({
  profile: one(profileSchema, {
    fields: [userSchema.id],
    references: [profileSchema.user_id],
  }),
}));

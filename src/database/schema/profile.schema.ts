import { relations, sql } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { userSchema } from './user.schema';

export const profileSchema = pgTable('profile', {
  id: uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  user_id: uuid('user_id').references(() => userSchema.id),
  email: text('email').notNull(),
  name: text('name').notNull(),
  department: text('department').notNull(),
  position: text('position').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at')
    .$onUpdate(() => sql`now()`)
    .notNull(),
});

export const profileRelations = relations(profileSchema, ({ one }) => ({
  user: one(userSchema, {
    fields: [profileSchema.user_id],
    references: [userSchema.id],
  }),
}));

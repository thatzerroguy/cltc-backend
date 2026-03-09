import { date, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { userSchema } from './user.schema';
import { relations } from 'drizzle-orm';

export const newsSchema = pgTable('news', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  excerpt: text('excerpt').notNull(),
  authorId: uuid('authorId').references(() => userSchema.id),
  authorName: text('authorName').notNull(),
  publishDate: date('publishDate').notNull(),
  mainImage: text('mainImage').notNull(),
  optionalImages: text('optionalImages').array().default([]),
  status: text('status').notNull(),
});

export const newsRelation = relations(newsSchema, ({ many }) => ({
  author: many(userSchema),
}));

import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const dataset = pgTable('dataset', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  createdAt: timestamp('created_at')
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp('updated_at')
    .$defaultFn(() => new Date())
    .notNull(),
});

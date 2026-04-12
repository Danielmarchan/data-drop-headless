import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const role = pgTable('role', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at')
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp('updated_at')
    .$defaultFn(() => new Date())
    .notNull(),
});

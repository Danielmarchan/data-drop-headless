import { boolean, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { dataset } from './datasets';

export const upload = pgTable('upload', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  fileName: text('file_name').notNull(),
  visible: boolean('visible')
    .$defaultFn(() => true)
    .notNull(),
  rowCount: integer('row_count'),
  datasetId: uuid('dataset_id')
    .notNull()
    .references(() => dataset.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at')
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp('updated_at')
    .$defaultFn(() => new Date())
    .notNull(),
});

export type SelectUpload = typeof upload.$inferSelect;
export type InsertUpload = typeof upload.$inferInsert;

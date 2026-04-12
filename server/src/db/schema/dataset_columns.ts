import { boolean, integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { dataset } from '@/db/schema/datasets';

export const columnType = pgEnum('column_type', ['string', 'number', 'date', 'boolean']);

export const datasetColumn = pgTable('dataset_column', {
  id: uuid('id').primaryKey().defaultRandom(),
  datasetId: uuid('dataset_id')
    .notNull()
    .references(() => dataset.id, { onDelete: 'cascade' }),
  name: text('name').notNull(), // must match CSV header exactly
  type: columnType('type').notNull(),
  required: boolean('required')
    .$defaultFn(() => true)
    .notNull(),
  position: integer('position').notNull(), // display/validation order
  createdAt: timestamp('created_at')
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp('updated_at')
    .$defaultFn(() => new Date())
    .notNull(),
});

export type SelectDatasetColumn = typeof datasetColumn.$inferSelect;
export type InsertDatasetColumn = typeof datasetColumn.$inferInsert;

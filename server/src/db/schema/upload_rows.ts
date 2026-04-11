import { integer, jsonb, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { upload } from './uploads';

export const uploadRow = pgTable('upload_row', {
  id: uuid('id').primaryKey().defaultRandom(),
  uploadId: uuid('upload_id')
    .notNull()
    .references(() => upload.id, { onDelete: 'cascade' }),
  rowIndex: integer('row_index').notNull(), // preserves original CSV row order
  data: jsonb('data').notNull(),            // { column_name: value, ... }
  createdAt: timestamp('created_at')
    .$defaultFn(() => new Date())
    .notNull(),
});

export type SelectUploadRow = typeof uploadRow.$inferSelect;
export type InsertUploadRow = typeof uploadRow.$inferInsert;

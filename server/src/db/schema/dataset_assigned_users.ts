import { pgTable, primaryKey, text, uuid } from 'drizzle-orm/pg-core';
import { user } from './users';
import { dataset } from './datasets';

export const datasetAssignedUser = pgTable(
  'dataset_assigned_user',
  {
    assignedUserId: text('assigned_user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    datasetId: uuid('dataset_id')
      .notNull()
      .references(() => dataset.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.assignedUserId, t.datasetId] })],
);

export type SelectDatasetAssignedUser = typeof datasetAssignedUser.$inferSelect;
export type InsertDatasetAssignedUser = typeof datasetAssignedUser.$inferInsert;

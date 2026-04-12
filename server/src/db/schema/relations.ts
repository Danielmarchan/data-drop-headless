import { relations } from 'drizzle-orm';
import { user } from '@/db/schema/users';
import { account } from '@/db/schema/accounts';
import { session } from '@/db/schema/sessions';
import { dataset } from '@/db/schema/datasets';
import { upload } from '@/db/schema/uploads';
import { datasetAssignedUser } from '@/db/schema/dataset_assigned_users';
import { role } from '@/db/schema/roles';
import { datasetColumn } from '@/db/schema/dataset_columns';
import { uploadRow } from '@/db/schema/upload_rows';

export const userRelations = relations(user, ({ many, one }) => ({
  account: many(account),
  session: many(session),
  datasetAssignedUsers: many(datasetAssignedUser),
  role: one(role, { fields: [user.roleId], references: [role.id] }),
}));

export const roleRelations = relations(role, ({ many }) => ({
  users: many(user),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const datasetRelations = relations(dataset, ({ many }) => ({
  uploads: many(upload),
  datasetAssignedUsers: many(datasetAssignedUser),
  columns: many(datasetColumn),
}));

export const uploadRelations = relations(upload, ({ one, many }) => ({
  dataset: one(dataset, { fields: [upload.datasetId], references: [dataset.id] }),
  rows: many(uploadRow),
}));

export const datasetColumnRelations = relations(datasetColumn, ({ one }) => ({
  dataset: one(dataset, { fields: [datasetColumn.datasetId], references: [dataset.id] }),
}));

export const uploadRowRelations = relations(uploadRow, ({ one }) => ({
  upload: one(upload, { fields: [uploadRow.uploadId], references: [upload.id] }),
}));

export const datasetAssignedUserRelations = relations(datasetAssignedUser, ({ one }) => ({
  user: one(user, { fields: [datasetAssignedUser.assignedUserId], references: [user.id] }),
  dataset: one(dataset, { fields: [datasetAssignedUser.datasetId], references: [dataset.id] }),
}));

import { and, count, desc, eq } from 'drizzle-orm';

import { dataset, datasetAssignedUser, upload } from '@/db/schema/index';
import { db, type Database } from '@/db/index';
import { viewerDatasetSchema, type ViewerDataset, viewerDatasetWithUploadCountSchema, type ViewerDatasetWithUploadCount } from '@data-drop/api-schema';
import { type ServiceResponse } from '@/types';
import { statusCodes } from '@/constants/statusCodes';

class ViewerDatasetsService {
  constructor(
    private db: Database,
  ) {}

  async getDatasetsAssignedToCurrentUser(
    userId: string,
  ): Promise<ServiceResponse<ViewerDatasetWithUploadCount[]>> {
    try {
      const rows = await this.db
        .select({
          id: dataset.id,
          title: dataset.title,
          slug: dataset.slug,
          uploadCount: count(upload.id),
        })
        .from(dataset)
        .innerJoin(datasetAssignedUser, eq(datasetAssignedUser.datasetId, dataset.id))
        .leftJoin(upload, and(eq(upload.datasetId, dataset.id), eq(upload.visible, true)))
        .where(eq(datasetAssignedUser.assignedUserId, userId))
        .groupBy(dataset.id)
        .orderBy(desc(dataset.createdAt));

      return {
        success: true,
        data: rows.map((row) =>
          viewerDatasetWithUploadCountSchema.parse({
            ...row,
            uploadCount: Number(row.uploadCount),
          }),
        ),
      };
    } catch (error) {
      console.error('Error fetching assigned datasets:', error);
      return {
        success: false,
        error: {
          statusCode: statusCodes.INTERNAL_SERVER_ERROR,
          message: 'Failed to fetch assigned datasets',
        },
      };
    }
  }

  async getAssignedDatasetById(
    datasetId: string,
  ): Promise<ServiceResponse<ViewerDataset>> {
    try {
      const found = await this.db.query.dataset.findFirst({
        where: (fields, { eq }) => eq(fields.id, datasetId),
      });

      if (!found) {
        return {
          success: false,
          error: { statusCode: statusCodes.NOT_FOUND, message: 'Dataset not found' },
        };
      }

      return { success: true, data: viewerDatasetSchema.parse(found) };
    } catch (error) {
      console.error('Error fetching assigned dataset:', error);
      return {
        success: false,
        error: {
          statusCode: statusCodes.INTERNAL_SERVER_ERROR,
          message: 'Failed to fetch assigned dataset',
        },
      };
    }
  }
}

export default new ViewerDatasetsService(db);

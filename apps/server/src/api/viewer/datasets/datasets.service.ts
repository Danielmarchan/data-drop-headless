import { and, count, countDistinct, desc, eq, ilike } from 'drizzle-orm';

import { dataset, datasetAssignedUser, upload } from '@/db/schema/index';
import { type Database } from '@/db/index';
import {
  viewerDatasetSchema,
  type ViewerDataset,
  viewerDatasetWithUploadCountSchema,
  type ViewerDatasetWithUploadCount,
  type PaginatedList,
} from '@data-drop/api-schema';
import { type ServiceResponse } from '@/types';
import { statusCodes } from '@/constants/statusCodes';
import logger from '@/services/logging.service';

class ViewerDatasetsService {
  constructor(
    private db: Database,
  ) {}

  async getPaginatedAssignedDatasets(
    userId: string,
    search: string | undefined,
    page: number,
    limit: number,
  ): Promise<ServiceResponse<PaginatedList<ViewerDatasetWithUploadCount>>> {
    try {
      const searchCondition = search ? ilike(dataset.title, `%${search}%`) : undefined;
      const whereClause = and(eq(datasetAssignedUser.assignedUserId, userId), searchCondition);

      const countResult = await this.db
        .select({ total: countDistinct(dataset.id) })
        .from(dataset)
        .innerJoin(datasetAssignedUser, eq(datasetAssignedUser.datasetId, dataset.id))
        .where(whereClause);

      const total = countResult[0]?.total ?? 0;
      const totalPages = Math.max(1, Math.ceil(total / limit));
      const safePage = Math.min(page, totalPages);

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
        .where(whereClause)
        .groupBy(dataset.id)
        .orderBy(desc(dataset.createdAt))
        .limit(limit)
        .offset((safePage - 1) * limit);

      return {
        success: true,
        data: {
          nodes: rows.map((row) =>
            viewerDatasetWithUploadCountSchema.parse({
              ...row,
              uploadCount: Number(row.uploadCount),
            }),
          ),
          total,
          pageInfo: {
            page: safePage,
            totalPages,
          },
        },
      };
    } catch (error) {
      logger.error('Error fetching assigned datasets:', error);
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
      logger.error('Error fetching assigned dataset:', error);
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

export default ViewerDatasetsService;

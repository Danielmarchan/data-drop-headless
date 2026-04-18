import { and, count, desc, eq, ilike } from 'drizzle-orm';

import { dataset, datasetAssignedUser, upload } from '@/db/schema/index';
import { db, type Database } from '@/db/index';
import { adminListDatasetSchemaServer, datasetDtoSchemaServer } from './datasets.schema';
import { AdminListDataset, type PaginatedList, type DatasetDto, viewerDatasetSchema, type ViewerDataset, viewerDatasetWithUploadCountSchema, type ViewerDatasetWithUploadCount } from '@data-drop/api-schema';
import { type ControllerResponse } from '@/types';
import { statusCodes } from '@/constants/statusCodes';

class DatasetsController {
  constructor(
    private db: Database,
  ) {}

  async getPaginatedDatasets(
    search: string | undefined,
    page: number,
    limit: number,
  ): Promise<ControllerResponse<PaginatedList<AdminListDataset>>> {
    try {
      const whereClause = search ? ilike(dataset.title, `%${search}%`) : undefined;

      const countResult = await this.db.select({ total: count() }).from(dataset).where(whereClause);
      const total = countResult[0]?.total ?? 0;
      const totalPages = Math.max(1, Math.ceil(total / limit));
      const safePage = Math.min(page, totalPages);

      const datasets = await this.db.query.dataset.findMany({
        where: search
          ? (fields, ops) => ops.ilike(fields.title, `%${search}%`)
          : undefined,
        orderBy: [desc(dataset.createdAt)],
        limit,
        offset: (safePage - 1) * limit,
      });

      return {
        success: true,
        data: {
          nodes: datasets.map(d => adminListDatasetSchemaServer.parse(d)),
          total,
          pageInfo: {
            page: safePage,
            totalPages,
          },
        },
      };
    } catch (error) {
      console.error('Error fetching datasets:', error);
      return {
        success: false,
        error: {
          statusCode: statusCodes.INTERNAL_SERVER_ERROR,
          message: 'Failed to fetch datasets',
        },
      };
    }
  }

  async getDatasetsAssignedToCurrentUser(
    userId: string,
  ): Promise<ControllerResponse<ViewerDatasetWithUploadCount[]>> {
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
  ): Promise<ControllerResponse<ViewerDataset>> {
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

  async getDatasetById(id: string): Promise<ControllerResponse<DatasetDto>> {
    try {
      const found = await this.db.query.dataset.findFirst({
        with: { columns: true },
        where: (fields, { eq }) => eq(fields.id, id),
      });

      if (!found) {
        return {
          success: false,
          error: { statusCode: statusCodes.NOT_FOUND, message: 'Dataset not found' },
        };
      }

      return { success: true, data: datasetDtoSchemaServer.parse(found) };
    } catch (error) {
      console.error('Error fetching dataset:', error);
      return {
        success: false,
        error: { statusCode: statusCodes.INTERNAL_SERVER_ERROR, message: 'Failed to fetch dataset' },
      };
    }
  }
}

export default new DatasetsController(db);

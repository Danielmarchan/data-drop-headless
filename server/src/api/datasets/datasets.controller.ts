import { count, desc, eq, ilike } from 'drizzle-orm';

import { dataset } from '@/db/schema/index';
import { db, type Database } from '@/db/index';
import { DatasetDto, datasetDtoSchemaServer } from './datasets.schema';
import { ControllerResponse, PaginatedList } from '@data-drop/api-schema';
import { statusCodes } from '@/constants/statusCodes';

class DatasetsController {
  constructor(
    private db: Database,
  ) {}

  async getPaginatedDatasets(
    search: string | undefined,
    page: number,
    limit: number,
  ): Promise<ControllerResponse<PaginatedList<DatasetDto>>> {
    try {
      const whereClause = search ? ilike(dataset.title, `%${search}%`) : undefined;

      const countResult = await this.db.select({ total: count() }).from(dataset).where(whereClause);
      const total = countResult[0]?.total ?? 0;
      const totalPages = Math.max(1, Math.ceil(total / limit));
      const safePage = Math.min(page, totalPages);

      const datasets = await this.db.query.dataset.findMany({
        with: { columns: true },
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
          nodes: datasets.map(d => datasetDtoSchemaServer.parse(d)),
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

  async updateDataset(
    id: string,
    input: { title?: string },
  ): Promise<ControllerResponse<DatasetDto>> {
    try {
      const [updated] = await this.db
        .update(dataset)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(dataset.id, id))
        .returning();

      if (!updated) {
        return {
          success: false,
          error: { statusCode: statusCodes.NOT_FOUND, message: 'Dataset not found' },
        };
      }

      const withRelations = await this.db.query.dataset.findFirst({
        with: { columns: true },
        where: (fields, { eq }) => eq(fields.id, updated.id),
      });

      return { success: true, data: datasetDtoSchemaServer.parse(withRelations) };
    } catch (error) {
      console.error('Error updating dataset:', error);
      return {
        success: false,
        error: { statusCode: statusCodes.INTERNAL_SERVER_ERROR, message: 'Failed to update dataset' },
      };
    }
  }
}

export default new DatasetsController(db);

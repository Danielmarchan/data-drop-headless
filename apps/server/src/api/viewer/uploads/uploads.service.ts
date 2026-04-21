import { and, count, desc, eq, ilike } from 'drizzle-orm';

import { upload } from '@/db/schema/index';
import { db, type Database } from '@/db/index';
import { type PaginatedList, viewerUploadListItemSchema, type ViewerUploadListItem, viewerUploadDetailDtoSchema, type ViewerUploadDetailDto } from '@data-drop/api-schema';
import { type ServiceResponse } from '@/types';
import { statusCodes } from '@/constants/statusCodes';

class ViewerUploadsService {
  constructor(
    private db: Database,
  ) {}

  async getVisibleUploadsByDatasetId(
    id: string,
    search: string | undefined,
    page: number,
    limit: number,
  ): Promise<ServiceResponse<PaginatedList<ViewerUploadListItem>>> {
    try {
      const countResult = await this.db
        .select({ total: count() })
        .from(upload)
        .where(and(
          eq(upload.datasetId, id),
          eq(upload.visible, true),
          search ? ilike(upload.title, `%${search}%`) : undefined,
        ));
      const total = countResult[0]?.total ?? 0;
      const totalPages = Math.max(1, Math.ceil(total / limit));
      const safePage = Math.min(page, totalPages);

      const uploads = await this.db.query.upload.findMany({
        columns: { id: true, title: true },
        where: (fields, ops) =>
          ops.and(
            ops.eq(fields.datasetId, id),
            ops.eq(fields.visible, true),
            search ? ops.ilike(fields.title, `%${search}%`) : undefined,
          ),
        orderBy: [desc(upload.createdAt)],
        limit,
        offset: (safePage - 1) * limit,
      });

      return {
        success: true,
        data: {
          nodes: uploads.map((u) => viewerUploadListItemSchema.parse(u)),
          total,
          pageInfo: {
            page: safePage,
            totalPages,
          },
        },
      };
    } catch (error) {
      console.error('Error fetching visible uploads for dataset:', error);
      return {
        success: false,
        error: {
          statusCode: statusCodes.INTERNAL_SERVER_ERROR,
          message: 'Failed to fetch uploads',
        },
      };
    }
  }

  async getUploadWithRowsById(
    id: string,
    datasetId: string,
  ): Promise<ServiceResponse<ViewerUploadDetailDto>> {
    try {
      const found = await this.db.query.upload.findFirst({
        columns: { id: true, title: true },
        where: (fields, { eq, and }) =>
          and(eq(fields.id, id), eq(fields.datasetId, datasetId), eq(fields.visible, true)),
        with: {
          rows: {
            columns: { rowIndex: true, data: true },
            orderBy: (fields, { asc }) => [asc(fields.rowIndex)],
          },
        },
      });

      if (!found) {
        return {
          success: false,
          error: { statusCode: statusCodes.NOT_FOUND, message: 'Upload not found' },
        };
      }

      return { success: true, data: viewerUploadDetailDtoSchema.parse(found) };
    } catch (error) {
      console.error('Error fetching upload with rows:', error);
      return {
        success: false,
        error: {
          statusCode: statusCodes.INTERNAL_SERVER_ERROR,
          message: 'Failed to fetch upload',
        },
      };
    }
  }
}

export default new ViewerUploadsService(db);

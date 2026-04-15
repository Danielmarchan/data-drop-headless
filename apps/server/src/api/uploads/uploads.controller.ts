import { count, desc, eq, ilike } from 'drizzle-orm';

import { upload } from '@/db/schema/index';
import { db, type Database } from '@/db/index';
import { UploadDto, uploadDtoSchemaServer } from './uploads.schema';
import { ControllerResponse, PaginatedList } from '@data-drop/api-schema';
import { statusCodes } from '@/constants/statusCodes';

class UploadsController {
  constructor(
    private db: Database,
  ) {}

  async getPaginatedUploads(
    search: string | undefined,
    page: number,
    limit: number,
  ): Promise<ControllerResponse<PaginatedList<UploadDto>>> {
    try {
      const whereClause = search ? ilike(upload.title, `%${search}%`) : undefined;

      const countResult = await this.db.select({ total: count() }).from(upload).where(whereClause);
      const total = countResult[0]?.total ?? 0;
      const totalPages = Math.max(1, Math.ceil(total / limit));
      const safePage = Math.min(page, totalPages);

      const uploads = await this.db.query.upload.findMany({
        with: { dataset: true },
        where: search
          ? (fields, ops) => ops.ilike(fields.title, `%${search}%`)
          : undefined,
        orderBy: [desc(upload.createdAt)],
        limit,
        offset: (safePage - 1) * limit,
      });

      return {
        success: true,
        data: {
          nodes: uploads.map(u => uploadDtoSchemaServer.parse(u)),
          total,
          pageInfo: {
            page: safePage,
            totalPages,
          },
        },
      };
    } catch (error) {
      console.error('Error fetching uploads:', error);
      return {
        success: false,
        error: {
          statusCode: statusCodes.INTERNAL_SERVER_ERROR,
          message: 'Failed to fetch uploads',
        },
      };
    }
  }

  async getUploadById(id: string): Promise<ControllerResponse<UploadDto>> {
    try {
      const found = await this.db.query.upload.findFirst({
        with: { dataset: true },
        where: (fields, { eq }) => eq(fields.id, id),
      });

      if (!found) {
        return {
          success: false,
          error: { statusCode: statusCodes.NOT_FOUND, message: 'Upload not found' },
        };
      }

      return { success: true, data: uploadDtoSchemaServer.parse(found) };
    } catch (error) {
      console.error('Error fetching upload:', error);
      return {
        success: false,
        error: { statusCode: statusCodes.INTERNAL_SERVER_ERROR, message: 'Failed to fetch upload' },
      };
    }
  }

  async createUpload(input: {
    title: string;
    fileName: string;
    datasetId: string;
    visible?: boolean;
    rowCount?: number;
  }): Promise<ControllerResponse<UploadDto>> {
    try {
      const [created] = await this.db
        .insert(upload)
        .values(input)
        .returning();

      const withRelations = await this.db.query.upload.findFirst({
        with: { dataset: true },
        where: (fields, { eq }) => eq(fields.id, created!.id),
      });

      return { success: true, data: uploadDtoSchemaServer.parse(withRelations) };
    } catch (error) {
      console.error('Error creating upload:', error);
      return {
        success: false,
        error: { statusCode: statusCodes.INTERNAL_SERVER_ERROR, message: 'Failed to create upload' },
      };
    }
  }

  async updateUpload(
    id: string,
    input: { title?: string; visible?: boolean; rowCount?: number },
  ): Promise<ControllerResponse<UploadDto>> {
    try {
      const [updated] = await this.db
        .update(upload)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(upload.id, id))
        .returning();

      if (!updated) {
        return {
          success: false,
          error: { statusCode: statusCodes.NOT_FOUND, message: 'Upload not found' },
        };
      }

      const withRelations = await this.db.query.upload.findFirst({
        with: { dataset: true },
        where: (fields, { eq }) => eq(fields.id, updated.id),
      });

      return { success: true, data: uploadDtoSchemaServer.parse(withRelations) };
    } catch (error) {
      console.error('Error updating upload:', error);
      return {
        success: false,
        error: { statusCode: statusCodes.INTERNAL_SERVER_ERROR, message: 'Failed to update upload' },
      };
    }
  }

  async deleteUpload(id: string): Promise<ControllerResponse<null>> {
    try {
      const [deleted] = await this.db
        .delete(upload)
        .where(eq(upload.id, id))
        .returning({ id: upload.id });

      if (!deleted) {
        return {
          success: false,
          error: { statusCode: statusCodes.NOT_FOUND, message: 'Upload not found' },
        };
      }

      return { success: true, data: null };
    } catch (error) {
      console.error('Error deleting upload:', error);
      return {
        success: false,
        error: { statusCode: statusCodes.INTERNAL_SERVER_ERROR, message: 'Failed to delete upload' },
      };
    }
  }
}

export default new UploadsController(db);

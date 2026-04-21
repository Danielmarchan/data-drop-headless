import { and, count, desc, eq, ilike } from 'drizzle-orm';
import { parse } from 'csv-parse/sync';

import { upload, uploadRow } from '@/db/schema/index';
import { db, type Database } from '@/db/index';
import { type UploadDto, uploadDtoSchemaServer } from './uploads.schema';
import { type PaginatedList, type UpdateUploadInput } from '@data-drop/api-schema';
import { type ServiceResponse } from '@/types';
import { statusCodes } from '@/constants/statusCodes';

class AdminUploadsService {
  constructor(
    private db: Database,
  ) {}

  async getUploadById(id: string): Promise<ServiceResponse<UploadDto>> {
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

  async updateUpload(
    id: string,
    input: UpdateUploadInput,
  ): Promise<ServiceResponse<UploadDto>> {
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

  async deleteUpload(id: string): Promise<ServiceResponse<null>> {
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

  async getUploadsByDatasetId(
    id: string,
    search: string | undefined,
    page: number,
    limit: number,
  ): Promise<ServiceResponse<PaginatedList<UploadDto>>> {
    try {
      const datasetExists = await this.db.query.dataset.findFirst({
        where: (fields, { eq }) => eq(fields.id, id),
      });

      if (!datasetExists) {
        return {
          success: false,
          error: { statusCode: statusCodes.NOT_FOUND, message: 'Dataset not found' },
        };
      }

      const whereClause = search
        ? and(eq(upload.datasetId, id), ilike(upload.title, `%${search}%`))
        : eq(upload.datasetId, id);

      const countResult = await this.db.select({ total: count() }).from(upload).where(whereClause);
      const total = countResult[0]?.total ?? 0;
      const totalPages = Math.max(1, Math.ceil(total / limit));
      const safePage = Math.min(page, totalPages);

      const uploads = await this.db.query.upload.findMany({
        with: { dataset: true },
        where: search
          ? (fields, ops) => ops.and(ops.eq(fields.datasetId, id), ops.ilike(fields.title, `%${search}%`))
          : (fields, ops) => ops.eq(fields.datasetId, id),
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
      console.error('Error fetching uploads for dataset:', error);
      return {
        success: false,
        error: {
          statusCode: statusCodes.INTERNAL_SERVER_ERROR,
          message: 'Failed to fetch uploads',
        },
      };
    }
  }

  async createUploadFromCsv(
    datasetId: string,
    file: Express.Multer.File,
  ): Promise<ServiceResponse<UploadDto>> {
    try {
      const datasetWithColumns = await this.db.query.dataset.findFirst({
        with: { columns: true },
        where: (fields, { eq }) => eq(fields.id, datasetId),
      });

      if (!datasetWithColumns) {
        return {
          success: false,
          error: {
            statusCode: statusCodes.NOT_FOUND,
            message: 'Dataset not found'
          }
        };
      }

      if (datasetWithColumns.columns.length === 0) {
        return {
          success: false,
          error: {
            statusCode: statusCodes.UNPROCESSABLE_ENTITY,
            message: 'Dataset has no columns defined'
          }
        };
      }

      // Parse CSV and validate against dataset columns
      let records: Record<string, string>[];
      try {
        records = parse(file.buffer, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
          bom: true
        });
      } catch {
        return {
          success: false,
          error: {
            statusCode: statusCodes.UNPROCESSABLE_ENTITY,
            message: 'CSV file could not be parsed',
          }
        };
      }

      if (records.length === 0) {
        return {
          success: false,
          error: {
            statusCode: statusCodes.UNPROCESSABLE_ENTITY,
            message: 'CSV file contains no data rows',
          }
        };
      }

      // Check for missing columns
      const csvHeaders = Object.keys(records[0]!);
      const columnNames = datasetWithColumns.columns.map(c => c.name);
      const missingColumns = columnNames.filter(name => !csvHeaders.includes(name));

      if (missingColumns.length > 0) {
        return {
          success: false,
          error: {
            statusCode: statusCodes.UNPROCESSABLE_ENTITY,
            message: `CSV is missing required columns: ${missingColumns.join(', ')}`,
          },
        };
      }

      // Create upload and upload-rows in a transaction
      const fileName = file.originalname;
      const title = await this.getUploadTitle(datasetWithColumns.title);
      const rowCount = records.length;

      let createdUploadId: string;
      await this.db.transaction(async (tx) => {
        // Insert upload record
        const [newUpload] = await tx.insert(upload).values({
          title,
          fileName,
          datasetId,
          rowCount
        }).returning();

        createdUploadId = newUpload!.id;

        // Define row payloads
        const rowPayloads = records.map((record, index) => ({
          uploadId: createdUploadId,
          rowIndex: index,
          data: Object.fromEntries(columnNames.map(name => [name, record[name] ?? null])),
        }));

        // Insert in batches of 500 to avoid overwhelming the database
        const CHUNK_SIZE = 500;
        for (let i = 0; i < rowPayloads.length; i += CHUNK_SIZE) {
          await tx.insert(uploadRow).values(rowPayloads.slice(i, i + CHUNK_SIZE));
        }
      });

      // Fetch and return UploadDto
      const uploadWithDataset = await this.db.query.upload.findFirst({
        with: { dataset: true },
        where: (fields, { eq }) => eq(fields.id, createdUploadId),
      });

      return {
        success: true,
        data: uploadDtoSchemaServer.parse(uploadWithDataset)
      };
    } catch (error) {
      console.error('Error creating upload from CSV:', error);
      return {
        success: false,
        error: {
          statusCode: statusCodes.INTERNAL_SERVER_ERROR,
          message: 'Failed to create upload'
        },
      };
    }
  }

  private async getUploadTitle(datasetTitle: string) {
    const baseTitle = datasetTitle + ' - ' + this.formatDate(new Date());

    const existing = await this.db.query.upload.findMany({
      columns: { title: true },
      where: (fields, { or, eq, like }) =>
        or(eq(fields.title, baseTitle), like(fields.title, `${baseTitle} (%)`)),
    });

    if (existing.length === 0) {
      return baseTitle;
    }

    const escaped = baseTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const suffixPattern = new RegExp(`^${escaped} \\((\\d+)\\)$`);

    let maxSuffix = 0;
    for (const u of existing) {
      const match = u.title.match(suffixPattern);
      if (match) {
        maxSuffix = Math.max(maxSuffix, parseInt(match[1]!, 10));
      }
    }

    return `${baseTitle} (${maxSuffix + 1})`;
  }

  private formatDate(date: Date) {
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();

    return `${mm}/${dd}/${yyyy}`;
  }
}

export default new AdminUploadsService(db);

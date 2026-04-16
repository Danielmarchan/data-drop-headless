import path from 'path';
import { and, count, desc, eq, ilike } from 'drizzle-orm';
import { parse } from 'csv-parse/sync';

import { dataset, upload, uploadRow } from '@/db/schema/index';
import { db, type Database } from '@/db/index';
import { type DatasetDto, datasetDtoSchemaServer } from './datasets.schema';
import { type UploadDto, uploadDtoSchemaServer } from '../uploads/uploads.schema';
import { type ControllerResponse, type PaginatedList } from '@data-drop/api-schema';
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

  async getUploadsByDatasetId(
    id: string,
    search: string | undefined,
    page: number,
    limit: number,
  ): Promise<ControllerResponse<PaginatedList<UploadDto>>> {
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
  ): Promise<ControllerResponse<UploadDto>> {
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
      const title = path.basename(fileName, path.extname(fileName));
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

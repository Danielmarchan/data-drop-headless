import { randomUUID } from 'crypto';
import { count, desc, eq, ilike, or } from 'drizzle-orm';
import logger from '@/services/logging.service';

import { user, account, datasetAssignedUser } from '@/db/schema/index';
import { type Database } from '@/db/index';
import { hashPassword } from '@/auth';
import { type CreateUserInput, type UpdateUserInput, type UserDto, type UserDetailDto, userDtoSchemaServer, userDetailDtoSchemaServer } from './users.schema';
import { type PaginatedList } from '@data-drop/api-schema';
import { type ServiceResponse } from '@/types';
import { statusCodes } from '@/constants/statusCodes';

class AdminUsersService {
  constructor(
    private db: Database,
  ) {}

  async getPaginatedUsers(
    search: string | undefined,
    page: number,
    limit: number
  ): Promise<ServiceResponse<PaginatedList<UserDto>>> {
    try {
      const whereClause = search
        ? or(ilike(user.name, `%${search}%`), ilike(user.email, `%${search}%`))
        : undefined;

      const countResult = await this.db.select({ total: count() }).from(user).where(whereClause);
      const total = countResult[0]?.total ?? 0;
      const totalPages = Math.max(1, Math.ceil(total / limit));
      const safePage = Math.min(page, totalPages);
      const users = await this.db.query.user.findMany({
        with: {
          role: {
            columns: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
        where: search
          ? (fields, ops) =>
              ops.or(ops.ilike(fields.name, `%${search}%`), ops.ilike(fields.email, `%${search}%`))
          : undefined,
        orderBy: [desc(user.createdAt)],
        limit,
        offset: (safePage - 1) * limit,
      });
      const validatedUsers = users.map(u => userDtoSchemaServer.parse(u));

      return {
        success: true,
        data: {
          nodes: validatedUsers,
          total,
          pageInfo: {
            page: safePage,
            totalPages,
          },
        },
      };
    } catch (error) {
      logger.error('Error fetching users:', error);
      return {
        success: false,
        error: {
          statusCode: statusCodes.INTERNAL_SERVER_ERROR,
          message: 'Failed to fetch users',
        },
      };
    }
  }

  async getUserById(id: string): Promise<ServiceResponse<UserDetailDto>> {
    try {
      const found = await this.db.query.user.findFirst({
        with: {
          role: { columns: { id: true, name: true, description: true } },
          assignedDatasets: { with: { dataset: { columns: { id: true, title: true } } } },
        },
        where: (fields, { eq }) => eq(fields.id, id),
      });

      if (!found) {
        return {
          success: false,
          error: { statusCode: statusCodes.NOT_FOUND, message: 'User not found' },
        };
      }

      return { success: true, data: userDetailDtoSchemaServer.parse(found) };
    } catch (error) {
      logger.error('Error fetching user:', error);
      return {
        success: false,
        error: { statusCode: statusCodes.INTERNAL_SERVER_ERROR, message: 'Failed to fetch user' },
      };
    }
  }

  async createUser(input: CreateUserInput): Promise<ServiceResponse<UserDetailDto>> {
    try {
      const userId = randomUUID();
      const hashedPw = await hashPassword(input.password);
      const now = new Date();
      const name = `${input.firstName} ${input.lastName ?? ''}`.trim();

      const role = await this.db.query.role.findFirst({
        where: (fields, { eq }) => eq(fields.name, input.role),
      });

      if (!role) return {
        success: false,
        error: { statusCode: statusCodes.BAD_REQUEST, message: 'Invalid role name' },
      };

      await this.db.transaction(async (tx) => {
        await tx.insert(user).values({
          id: userId,
          name,
          email: input.email,
          firstName: input.firstName,
          lastName: input.lastName,
          roleId: role.id,
          emailVerified: false,
        });

        await tx.insert(account).values({
          id: randomUUID(),
          accountId: userId,
          providerId: 'credential',
          userId,
          password: hashedPw,
          createdAt: now,
          updatedAt: now,
        });

        if (input.assignedDatasetIds && input.assignedDatasetIds.length > 0) {
          await tx.insert(datasetAssignedUser).values(
            input.assignedDatasetIds.map((datasetId) => ({ assignedUserId: userId, datasetId }))
          );
        }
      });

      const userWithRole = await this.db.query.user.findFirst({
        with: {
          role: { columns: { id: true, name: true, description: true } },
          assignedDatasets: { with: { dataset: { columns: { id: true, title: true } } } },
        },
        where: (fields, { eq }) => eq(fields.id, userId),
      });

      return {
        success: true,
        data: userDetailDtoSchemaServer.parse(userWithRole)
      };
    } catch (error) {
      logger.error('Error creating user:', error);
      return {
        success: false,
        error: {
          statusCode: statusCodes.INTERNAL_SERVER_ERROR,
          message: 'Failed to create user'
        },
      };
    }
  }

  async updateUser(
    id: string,
    input: UpdateUserInput,
  ): Promise<ServiceResponse<UserDetailDto>> {
    try {
      const role = input.role
        ? await this.db.query.role.findFirst({ where: (fields, { eq }) => eq(fields.name, input.role!) })
        : undefined;

      if (input.role && !role) return {
        success: false,
        error: {
          statusCode: statusCodes.BAD_REQUEST,
          message: 'Invalid role name'
        },
      };

      const { role: _roleName, firstName, lastName, assignedDatasetIds, ...rest } = input;

      // Recompute name if either name part is being updated
      let name: string | undefined;
      if (firstName !== undefined || lastName !== undefined) {
        const existing = await this.db.query.user.findFirst({
          where: (fields, { eq }) => eq(fields.id, id),
        });
        const resolvedFirst = firstName ?? existing?.firstName ?? '';
        const resolvedLast = lastName ?? existing?.lastName ?? '';
        name = `${resolvedFirst} ${resolvedLast}`.trim();
      }

      let notFound = false;
      await this.db.transaction(async (tx) => {
        const [updated] = await tx
          .update(user)
          .set({ ...rest, firstName, lastName, name, roleId: role?.id, updatedAt: new Date() })
          .where(eq(user.id, id))
          .returning({ id: user.id });

        if (!updated) {
          notFound = true;
          return;
        }

        if (assignedDatasetIds !== undefined) {
          await tx.delete(datasetAssignedUser).where(eq(datasetAssignedUser.assignedUserId, id));
          if (assignedDatasetIds.length > 0) {
            await tx.insert(datasetAssignedUser).values(
              assignedDatasetIds.map((datasetId) => ({ assignedUserId: id, datasetId }))
            );
          }
        }
      });

      if (notFound) {
        return {
          success: false,
          error: { statusCode: statusCodes.NOT_FOUND, message: 'User not found' },
        };
      }

      const userWithRole = await this.db.query.user.findFirst({
        with: {
          role: { columns: { id: true, name: true, description: true } },
          assignedDatasets: { with: { dataset: { columns: { id: true, title: true } } } },
        },
        where: (fields, { eq }) => eq(fields.id, id),
      });

      return {
        success: true,
        data: userDetailDtoSchemaServer.parse(userWithRole)
      };
    } catch (error) {
      logger.error('Error updating user:', error);
      return {
        success: false,
        error: { statusCode: statusCodes.INTERNAL_SERVER_ERROR, message: 'Failed to update user' },
      };
    }
  }

  async deleteUser(id: string): Promise<ServiceResponse<null>> {
    try {
      const [deleted] = await this.db
        .delete(user)
        .where(eq(user.id, id))
        .returning({ id: user.id });

      if (!deleted) {
        return {
          success: false,
          error: {
            statusCode: statusCodes.NOT_FOUND,
            message: 'User not found'
          },
        };
      }

      return {
        success: true,
        data: null
      };
    } catch (error) {
      logger.error('Error deleting user:', error);
      return {
        success: false,
        error: {
          statusCode: statusCodes.INTERNAL_SERVER_ERROR,
          message: 'Failed to delete user'
        },
      };
    }
  }
}

export default AdminUsersService;

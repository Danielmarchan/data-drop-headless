import { randomUUID } from 'crypto';
import { count, desc, eq, ilike, or } from 'drizzle-orm';
import { hashPassword } from 'better-auth/crypto';

import { user, account } from '@/db/schema/index';
import { db, type Database } from '@/db/index';
import { UserDto, userDtoValidator } from './users.validators';
import { ControllerResponse, PaginatedList } from '@/types';
import { statusCodes } from '@/constants/statusCodes';

class UsersController {
  constructor(
    private db: Database,
  ) {}

  async getPaginatedUsers(
    search: string | undefined,
    page: number,
    limit: number
  ): Promise<ControllerResponse<PaginatedList<UserDto>>> {
    try {
      const whereClause = search
        ? or(ilike(user.name, `%${search}%`), ilike(user.email, `%${search}%`))
        : undefined;
    
      const countResult = await this.db.select({ total: count() }).from(user).where(whereClause);
      const total = countResult[0]?.total ?? 0;
      const totalPages = Math.max(1, Math.ceil(total / limit));
      const safePage = Math.min(page, totalPages);
      const users = await this.db.query.user.findMany({
        with: { role: true },
        where: search
          ? (fields, ops) =>
              ops.or(ops.ilike(fields.name, `%${search}%`), ops.ilike(fields.email, `%${search}%`))
          : undefined,
        orderBy: [desc(user.createdAt)],
        limit,
        offset: (safePage - 1) * limit,
      });

      return {
        success: true,
        data: {
          nodes: users.map(user => userDtoValidator.parse(user)),
          total,
          pageInfo: {
            page: safePage,
            totalPages,
          },
        },
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      return {
        success: false,
        error: {
          statusCode: statusCodes.INTERNAL_SERVER_ERROR,
          message: 'Failed to fetch users',
        },
      };
    }
  }

  async getUserById(id: string): Promise<ControllerResponse<UserDto>> {
    try {
      const user = await this.db.query.user.findFirst({
        with: { role: true },
        where: (fields, { eq }) => eq(fields.id, id),
      });

      if (!user) {
        return {
          success: false,
          error: { statusCode: statusCodes.NOT_FOUND, message: 'User not found' },
        };
      }

      return { success: true, data: userDtoValidator.parse(user) };
    } catch (error) {
      console.error('Error fetching user:', error);
      return {
        success: false,
        error: { statusCode: statusCodes.INTERNAL_SERVER_ERROR, message: 'Failed to fetch user' },
      };
    }
  }

  async createUser(input: {
    name: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    roleId?: string;
  }): Promise<ControllerResponse<UserDto>> {
    try {
      const userId = randomUUID();
      const hashedPw = await hashPassword(input.password);
      const now = new Date();

      const [created] = await this.db
        .insert(user)
        .values({
          id: userId,
          name: input.name,
          email: input.email,
          firstName: input.firstName,
          lastName: input.lastName,
          roleId: input.roleId,
          emailVerified: false,
        })
        .returning();

      await this.db.insert(account).values({
        id: randomUUID(),
        accountId: userId,
        providerId: 'credential',
        userId,
        password: hashedPw,
        createdAt: now,
        updatedAt: now,
      });

      const withRole = await this.db.query.user.findFirst({
        with: { role: true },
        where: (fields, { eq }) => eq(fields.id, created!.id),
      });

      return { success: true, data: userDtoValidator.parse(withRole) };
    } catch (error) {
      console.error('Error creating user:', error);
      return {
        success: false,
        error: { statusCode: statusCodes.INTERNAL_SERVER_ERROR, message: 'Failed to create user' },
      };
    }
  }

  async updateUser(
    id: string,
    input: {
      name?: string;
      email?: string;
      firstName?: string;
      lastName?: string;
      roleId?: string;
    },
  ): Promise<ControllerResponse<UserDto>> {
    try {
      const [updated] = await this.db
        .update(user)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(user.id, id))
        .returning();

      if (!updated) {
        return {
          success: false,
          error: { statusCode: statusCodes.NOT_FOUND, message: 'User not found' },
        };
      }

      const withRole = await this.db.query.user.findFirst({
        with: { role: true },
        where: (fields, { eq }) => eq(fields.id, updated.id),
      });

      return { success: true, data: userDtoValidator.parse(withRole) };
    } catch (error) {
      console.error('Error updating user:', error);
      return {
        success: false,
        error: { statusCode: statusCodes.INTERNAL_SERVER_ERROR, message: 'Failed to update user' },
      };
    }
  }

  async deleteUser(id: string): Promise<ControllerResponse<null>> {
    try {
      const [deleted] = await this.db
        .delete(user)
        .where(eq(user.id, id))
        .returning({ id: user.id });

      if (!deleted) {
        return {
          success: false,
          error: { statusCode: statusCodes.NOT_FOUND, message: 'User not found' },
        };
      }

      return { success: true, data: null };
    } catch (error) {
      console.error('Error deleting user:', error);
      return {
        success: false,
        error: { statusCode: statusCodes.INTERNAL_SERVER_ERROR, message: 'Failed to delete user' },
      };
    }
  }
}

export default new UsersController(db);

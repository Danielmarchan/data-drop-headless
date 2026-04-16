import { randomUUID } from 'crypto';
import { count, desc, eq, ilike, or } from 'drizzle-orm';
import { user, account } from '@/db/schema/index';
import { db, type Database } from '@/db/index';
import { hashPassword } from '@/api/auth';
import { type CreateUserInput, type UpdateUserInput, type UserDto, userDtoSchemaServer } from './users.schema';
import { type PaginatedList } from '@data-drop/api-schema';
import { type ControllerResponse } from '@/types';
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
      const validatedUsers = users.filter(user => {
        const u = userDtoSchemaServer.safeParse(user);
        if (!u.success) {
          console.error('Invalid user data:', u.error, 'Original data:', user);
        }
        return u.success;       
      });


      return {
        success: true,
        data: {
          nodes: validatedUsers.map(user => userDtoSchemaServer.parse(user)),
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

      return { success: true, data: userDtoSchemaServer.parse(user) };
    } catch (error) {
      console.error('Error fetching user:', error);
      return {
        success: false,
        error: { statusCode: statusCodes.INTERNAL_SERVER_ERROR, message: 'Failed to fetch user' },
      };
    }
  }

  async createUser(input: CreateUserInput): Promise<ControllerResponse<UserDto>> {
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

      const [created] = await this.db
        .insert(user)
        .values({
          id: userId,
          name,
          email: input.email,
          firstName: input.firstName,
          lastName: input.lastName,
          roleId: role.id,
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

      const userWithRole = await this.db.query.user.findFirst({
        with: { role: true },
        where: (fields, { eq }) => eq(fields.id, created!.id),
      });

      return {
        success: true,
        data: userDtoSchemaServer.parse(userWithRole)
      };
    } catch (error) {
      console.error('Error creating user:', error);
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
  ): Promise<ControllerResponse<UserDto>> {
    try {
      const role = await this.db.query.role.findFirst({
        where: (fields, { eq }) => eq(fields.name, input.role ?? ''),
      });

      if (input.role && !role) return {
        success: false,
        error: {
        statusCode: statusCodes.BAD_REQUEST,
          message: 'Invalid role name'
        },
      };

      const [updated] = await this.db
        .update(user)
        .set({
          ...input,
          roleId: role ? role.id : undefined,
          updatedAt: new Date()
        })
        .where(eq(user.id, id))
        .returning();

      if (!updated) {
        return {
          success: false,
          error: {
            statusCode: statusCodes.NOT_FOUND,
            message: 'User not found'
          },
        };
      }

      const userWithRole = await this.db.query.user.findFirst({
        with: { role: true },
        where: (fields, { eq }) => eq(fields.id, updated.id),
      });

      return {
        success: true,
        data: userDtoSchemaServer.parse(userWithRole)
      };
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
      console.error('Error deleting user:', error);
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

export default new UsersController(db);

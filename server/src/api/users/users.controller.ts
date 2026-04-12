import { count, desc, eq, ilike, or } from 'drizzle-orm';
import { nanoid } from 'nanoid';

import { user } from '@/db/schema/index';
import { db, type Database } from '@/db/index';
import { UserDto, userDtoValidator } from './users.dto';
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
}

export default new UsersController(db);

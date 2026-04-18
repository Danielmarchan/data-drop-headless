import { type Request, type Response, type NextFunction } from 'express';
import { and, eq } from 'drizzle-orm';

import { type AuthSession } from '@/auth';
import { db } from '@/db';
import { datasetAssignedUser } from '@/db/schema/index';
import { statusCodes } from '@/constants/statusCodes';
import { idParamSchema } from '@/helpers/query-params.schema';

export async function requireViewerDatasetAccess(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const session = res.locals.session as AuthSession;
  const parsed = idParamSchema.safeParse(req.params.datasetId);

  if (!parsed.success) {
    res.status(statusCodes.NOT_FOUND).json({ error: 'Dataset not found' });
    return;
  }

  const assignment = await db.query.datasetAssignedUser.findFirst({
    where: and(
      eq(datasetAssignedUser.assignedUserId, session!.user.id),
      eq(datasetAssignedUser.datasetId, parsed.data),
    ),
  });

  if (!assignment) {
    res.status(statusCodes.NOT_FOUND).json({ error: 'Dataset not found' });
    return;
  }

  next();
}

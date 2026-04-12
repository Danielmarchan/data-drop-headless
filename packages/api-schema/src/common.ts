import z from 'zod';

export type ControllerResponse<T> =
  | { success: true; data: T }
  | { success: false; error: ControllerError };

export type ControllerError = {
  statusCode: number;
  message: string;
};

export const paginatedListSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    nodes: z.array(itemSchema),
    total: z.number(),
    pageInfo: z.object({
      page: z.number(),
      totalPages: z.number(),
    }),
  });

export type PaginatedList<T> = {
  nodes: T[];
  total: number;
  pageInfo: {
    page: number;
    totalPages: number;
  };
};

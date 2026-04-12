import z from 'zod';

export type ControllerResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: ControllerError;
};

export const controllerErrorValidator = z.object({
  statusCode: z.number(),
  message: z.string(),
});

export type ControllerError = z.infer<typeof controllerErrorValidator>;

export type PaginatedList<T> = {
  nodes: T[];
  total: number;
  pageInfo: {
    page: number;
    totalPages: number;
  };
}

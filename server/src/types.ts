export type ControllerResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: ControllerError;
};

export type ControllerError = {
  statusCode: number;
  message: string;
};
export type PaginatedList<T> = {
  nodes: T[];
  total: number;
  pageInfo: {
    page: number;
    totalPages: number;
  };
}

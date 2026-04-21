export type ServiceResponse<T> =
  | { success: true; data: T }
  | { success: false; error: ServiceError };

export type ServiceError = {
  statusCode: number;
  message: string;
}

export type ControllerResponse<T> =
  | { success: true; data: T }
  | { success: false; error: ControllerError };

export type ControllerError = {
  statusCode: number;
  message: string;
}

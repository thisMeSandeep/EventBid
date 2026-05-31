export type AppErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "BRIEF_CLOSED"
  | "DEADLINE_PASSED"
  | "DEAL_LOCK_FAILED"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

const ERROR_STATUS_CODES: Record<AppErrorCode, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  VALIDATION_ERROR: 422,
  BRIEF_CLOSED: 409,
  DEADLINE_PASSED: 409,
  DEAL_LOCK_FAILED: 409,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
};

export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function getHttpStatusForErrorCode(code: AppErrorCode): number {
  return ERROR_STATUS_CODES[code];
}

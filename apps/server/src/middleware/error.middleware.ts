import type { ErrorHandler } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { AppError, getHttpStatusForErrorCode } from "../lib/errors";
import { logger } from "../lib/logger";

export const errorHandler: ErrorHandler = (error, c) => {
  if (error instanceof AppError) {
    return c.json(
      {
        error: {
          code: error.code,
          message: error.message,
        },
      },
      getHttpStatusForErrorCode(error.code) as ContentfulStatusCode,
    );
  }

  logger.error({ err: error }, "Unhandled error");

  return c.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
      },
    },
    500,
  );
};

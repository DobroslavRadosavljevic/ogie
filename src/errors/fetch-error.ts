import type { ErrorCode } from "./types";

import { OgieError } from "./ogie-error";

/**
 * Error for HTTP/network failures
 */
export class FetchError extends OgieError {
  readonly statusCode?: number;
  override readonly _tag = "FetchError";

  constructor(
    message: string,
    url: string,
    statusCode?: number,
    cause?: Error,
    code: ErrorCode = "FETCH_ERROR"
  ) {
    super(message, code, url, cause);
    this.name = "FetchError";
    this.statusCode = statusCode;
  }

  /**
   * Cross-realm type guard using duck-typing instead of instanceof
   */
  static is(error: unknown): error is FetchError {
    if (!(error instanceof Error)) {
      return false;
    }
    const e = error as unknown as Record<string, unknown>;
    return e._tag === "FetchError" && typeof e.code === "string";
  }

  /**
   * Serialize error to a plain object
   */
  override toJSON() {
    return {
      ...super.toJSON(),
      statusCode: this.statusCode,
    };
  }
}

/**
 * Type guard to check if an error is a FetchError
 */
export const isFetchError = (error: unknown): error is FetchError =>
  FetchError.is(error);

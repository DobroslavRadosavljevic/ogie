import type { ErrorCode } from "./types";

/**
 * Base error class for all ogie errors
 */
export class OgieError extends Error {
  readonly code: ErrorCode;
  readonly url?: string;
  readonly _tag: string = "OgieError";

  constructor(message: string, code: ErrorCode, url?: string, cause?: Error) {
    super(message, { cause });
    this.name = "OgieError";
    this.code = code;
    this.url = url;
  }

  /**
   * Cross-realm type guard using duck-typing instead of instanceof
   */
  static is(error: unknown): error is OgieError {
    if (!(error instanceof Error)) {
      return false;
    }
    const e = error as unknown as Record<string, unknown>;
    const tag = e._tag;
    return (
      typeof e.code === "string" &&
      typeof tag === "string" &&
      (tag === "OgieError" || tag === "FetchError" || tag === "ParseError")
    );
  }

  /**
   * Serialize error to a plain object
   */
  toJSON() {
    return {
      code: this.code,
      message: this.message,
      name: this.name,
      stack: this.stack,
      url: this.url,
    };
  }
}

/**
 * Type guard to check if an error is an OgieError
 */
export const isOgieError = (error: unknown): error is OgieError =>
  OgieError.is(error);

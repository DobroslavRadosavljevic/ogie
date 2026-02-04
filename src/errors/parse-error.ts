import { OgieError } from "./ogie-error";

/**
 * Error for HTML parsing failures
 */
export class ParseError extends OgieError {
  override readonly _tag = "ParseError";

  constructor(message: string, url?: string, cause?: Error) {
    super(message, "PARSE_ERROR", url, cause);
    this.name = "ParseError";
  }

  /**
   * Cross-realm type guard using duck-typing instead of instanceof
   */
  static is(error: unknown): error is ParseError {
    if (!(error instanceof Error)) {
      return false;
    }
    const e = error as unknown as Record<string, unknown>;
    return e._tag === "ParseError" && typeof e.code === "string";
  }

  /**
   * Serialize error to a plain object
   */
  override toJSON() {
    return super.toJSON();
  }
}

/**
 * Type guard to check if an error is a ParseError
 */
export const isParseError = (error: unknown): error is ParseError =>
  ParseError.is(error);

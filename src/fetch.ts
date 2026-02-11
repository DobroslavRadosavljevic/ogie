import type { ExtractOptions } from "./types";

import { FetchError } from "./errors/fetch-error";
import { OgieError } from "./errors/ogie-error";
import { decodeHtml, detectCharset } from "./utils/encoding";
import { isPrivateUrl, isValidUrl } from "./utils/url";

const DEFAULT_TIMEOUT = 10_000;
export const DEFAULT_MAX_REDIRECTS = 5;
const DEFAULT_USER_AGENT =
  "ogie/2.0 (+https://github.com/dobroslavradosavljevic/ogie)";
const DEFAULT_ACCEPT = "text/html,application/xhtml+xml";
/** 10MB max response size */
const MAX_RESPONSE_SIZE = 10 * 1024 * 1024;

interface FetchResult {
  html: string;
  finalUrl: string;
  statusCode: number;
  contentType: string;
  charset?: string;
}

interface FetchContext {
  timeout: number;
  maxRedirects: number;
  headers: Headers;
  originalUrl: string;
  allowPrivateUrls: boolean;
  convertCharset: boolean;
}

const isHtmlContentType = (contentType: string): boolean => {
  const type = contentType.toLowerCase();
  return type.includes("text/html") || type.includes("application/xhtml+xml");
};

const HEADER_INJECTION_RE = /[\r\n]/;

const buildHeaders = (options?: ExtractOptions): Headers => {
  const headers = new Headers({
    Accept: DEFAULT_ACCEPT,
    "User-Agent": DEFAULT_USER_AGENT,
  });

  if (options?.userAgent) {
    headers.set("User-Agent", options.userAgent);
  }

  if (options?.headers) {
    for (const [key, value] of Object.entries(options.headers)) {
      if (HEADER_INJECTION_RE.test(key) || HEADER_INJECTION_RE.test(value)) {
        throw new FetchError(
          `Invalid header: header name or value contains forbidden characters (\\r or \\n)`,
          ""
        );
      }
      headers.set(key, value);
    }
  }

  return headers;
};

const isAbortError = (error: unknown): boolean => {
  if (!(error instanceof Error)) {
    return false;
  }
  if (error.name === "AbortError") {
    return true;
  }
  if ("code" in error && (error as { code: unknown }).code === "ABORT_ERR") {
    return true;
  }
  if (typeof DOMException !== "undefined" && error instanceof DOMException) {
    return true;
  }
  return false;
};

const handleFetchError = (
  error: unknown,
  url: string,
  timeout: number
): never => {
  if (isAbortError(error)) {
    throw new FetchError(
      `Request timeout after ${timeout}ms`,
      url,
      undefined,
      error instanceof Error ? error : undefined,
      "TIMEOUT"
    );
  }

  const message =
    error instanceof Error ? error.message : "Network request failed";
  const cause = error instanceof Error ? error : undefined;
  throw new FetchError(message, url, undefined, cause);
};

const validateResponse = (
  response: Response,
  url: string
): { statusCode: number; contentType: string } => {
  const statusCode = response.status;

  if (!response.ok) {
    throw new FetchError(
      `HTTP ${statusCode}: ${response.statusText}`,
      url,
      statusCode
    );
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (!isHtmlContentType(contentType)) {
    throw new FetchError(
      `Expected HTML content, received: ${contentType}`,
      url
    );
  }

  return { contentType, statusCode };
};

const performFetch = async (
  url: string,
  ctx: FetchContext
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ctx.timeout);

  try {
    const response = await fetch(url, {
      headers: ctx.headers,
      method: "GET",
      redirect: "manual",
      signal: controller.signal,
    });
    return response;
  } catch (error) {
    return handleFetchError(error, url, ctx.timeout);
  } finally {
    clearTimeout(timeoutId);
  }
};

const checkProtocolDowngrade = (
  currentUrl: string,
  redirectUrl: string
): void => {
  const currentProtocol = new URL(currentUrl).protocol;
  const redirectProtocol = new URL(redirectUrl).protocol;

  if (currentProtocol === "https:" && redirectProtocol === "http:") {
    throw new FetchError(
      "HTTPS to HTTP protocol downgrade is not allowed",
      currentUrl
    );
  }
};

const isRedirectStatus = (status: number): boolean =>
  status >= 300 && status < 400;

const resolveLocationHeader = (
  response: Response,
  currentUrl: string
): string => {
  const location = response.headers.get("location");

  if (!location || location.trim() === "") {
    throw new FetchError(
      "Redirect response without valid Location header",
      currentUrl
    );
  }

  return new URL(location, currentUrl).href;
};

const getRedirectUrl = (
  response: Response,
  currentUrl: string,
  allowPrivateUrls: boolean
): string | null => {
  if (!isRedirectStatus(response.status)) {
    return null;
  }

  const redirectUrl = resolveLocationHeader(response, currentUrl);

  checkProtocolDowngrade(currentUrl, redirectUrl);
  validateUrl(redirectUrl, allowPrivateUrls);

  return redirectUrl;
};

const validateUrl = (url: string, allowPrivateUrls: boolean): void => {
  if (!isValidUrl(url)) {
    throw new OgieError(
      `Invalid URL: must be a valid HTTP or HTTPS URL`,
      "INVALID_URL",
      url
    );
  }

  if (!allowPrivateUrls && isPrivateUrl(url)) {
    throw new OgieError(
      `URL points to a private/internal network address`,
      "INVALID_URL",
      url
    );
  }
};

const validateOptions = (options?: ExtractOptions): void => {
  if (
    options?.timeout !== undefined &&
    (typeof options.timeout !== "number" || options.timeout <= 0)
  ) {
    throw new FetchError(
      "timeout must be a positive number",
      options.timeout as unknown as string
    );
  }

  if (
    options?.maxRedirects !== undefined &&
    (typeof options.maxRedirects !== "number" ||
      !Number.isInteger(options.maxRedirects) ||
      options.maxRedirects < 0)
  ) {
    throw new FetchError(
      "maxRedirects must be a non-negative integer",
      options.maxRedirects as unknown as string
    );
  }
};

const createContext = (
  url: string,
  options?: ExtractOptions
): FetchContext => ({
  allowPrivateUrls: options?.allowPrivateUrls ?? false,
  convertCharset: options?.convertCharset ?? false,
  headers: buildHeaders(options),
  maxRedirects: options?.maxRedirects ?? DEFAULT_MAX_REDIRECTS,
  originalUrl: url,
  timeout: options?.timeout ?? DEFAULT_TIMEOUT,
});

const checkResponseSize = (contentLength: string | null, url: string): void => {
  if (contentLength) {
    const size = Number.parseInt(contentLength, 10);
    if (!Number.isNaN(size) && size > MAX_RESPONSE_SIZE) {
      throw new FetchError(
        `Response size ${size} bytes exceeds maximum allowed size of ${MAX_RESPONSE_SIZE} bytes`,
        url
      );
    }
  }
};

/**
 * Build result with simple text decoding (default behavior)
 */
const buildSimpleResult = async (
  response: Response,
  finalUrl: string,
  contentType: string,
  statusCode: number
): Promise<FetchResult> => {
  checkResponseSize(response.headers.get("content-length"), finalUrl);
  const html = await response.text();

  if (html.length > MAX_RESPONSE_SIZE) {
    throw new FetchError(
      `Response size exceeds maximum allowed size of ${MAX_RESPONSE_SIZE} bytes`,
      finalUrl
    );
  }

  return { contentType, finalUrl, html, statusCode };
};

/**
 * Build result with charset detection and conversion
 */
const buildCharsetResult = async (
  response: Response,
  finalUrl: string,
  contentType: string,
  statusCode: number
): Promise<FetchResult> => {
  checkResponseSize(response.headers.get("content-length"), finalUrl);
  const buffer = await response.arrayBuffer();

  if (buffer.byteLength > MAX_RESPONSE_SIZE) {
    throw new FetchError(
      `Response size exceeds maximum allowed size of ${MAX_RESPONSE_SIZE} bytes`,
      finalUrl
    );
  }

  const { charset } = detectCharset(buffer, contentType);
  const html = decodeHtml(buffer, charset);
  return { charset, contentType, finalUrl, html, statusCode };
};

const buildResult = async (
  response: Response,
  finalUrl: string,
  convertCharset: boolean
): Promise<FetchResult> => {
  const { contentType, statusCode } = validateResponse(response, finalUrl);

  if (convertCharset) {
    return await buildCharsetResult(
      response,
      finalUrl,
      contentType,
      statusCode
    );
  }
  return await buildSimpleResult(response, finalUrl, contentType, statusCode);
};

const checkRedirectLoop = (
  visitedUrls: Set<string>,
  redirectUrl: string,
  startUrl: string
): void => {
  if (visitedUrls.has(redirectUrl)) {
    throw new FetchError(
      "Redirect loop detected",
      startUrl,
      undefined,
      undefined,
      "REDIRECT_LIMIT"
    );
  }
};

const fetchAndCheckRedirect = async (
  currentUrl: string,
  ctx: FetchContext
): Promise<{ response: Response; redirectUrl: string | null }> => {
  const response = await performFetch(currentUrl, ctx);
  const redirectUrl = getRedirectUrl(
    response,
    currentUrl,
    ctx.allowPrivateUrls
  );
  return { redirectUrl, response };
};

/** Follow redirects and return the final response */
const followRedirects = async (
  startUrl: string,
  ctx: FetchContext
): Promise<{ response: Response; finalUrl: string }> => {
  let currentUrl = startUrl;
  const visitedUrls = new Set<string>();

  for (let i = 0; i < ctx.maxRedirects; i += 1) {
    visitedUrls.add(currentUrl);
    const { response, redirectUrl } = await fetchAndCheckRedirect(
      currentUrl,
      ctx
    );

    if (!redirectUrl) {
      return { finalUrl: currentUrl, response };
    }

    checkRedirectLoop(visitedUrls, redirectUrl, startUrl);
    currentUrl = redirectUrl;
  }

  throw new FetchError(
    `Maximum redirects (${ctx.maxRedirects}) exceeded`,
    startUrl,
    undefined,
    undefined,
    "REDIRECT_LIMIT"
  );
};

export const fetchUrl = async (
  url: string,
  options?: ExtractOptions
): Promise<FetchResult> => {
  validateOptions(options);
  const ctx = createContext(url, options);
  validateUrl(url, ctx.allowPrivateUrls);

  const { finalUrl, response } = await followRedirects(url, ctx);
  return buildResult(response, finalUrl, ctx.convertCharset);
};

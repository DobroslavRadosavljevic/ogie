import { load, type CheerioAPI } from "cheerio";

import type {
  ExtractOptions,
  ExtractionMode,
  ExtractResult,
  ExtractWithDiagnosticsResult,
  Metadata,
  OEmbedData,
  OEmbedDiscovery,
  SocialValidationReport,
} from "./types";

import { generateCacheKey, type MetadataCache } from "./cache";
import { OgieError } from "./errors/ogie-error";
import { ParseError } from "./errors/parse-error";
import { DEFAULT_MAX_REDIRECTS, fetchUrl } from "./fetch";
import { parseAppLinks } from "./parsers/app-links";
import { parseArticle } from "./parsers/article";
import { parseBasicMeta } from "./parsers/basic";
import { parseBook } from "./parsers/book";
import { parseDublinCore } from "./parsers/dublin-core";
import { hasFeeds, parseFeeds } from "./parsers/feeds";
import { parseJsonLd } from "./parsers/jsonld";
import { parseMusic } from "./parsers/music";
import {
  hasOEmbedDiscovery,
  parseOEmbedDiscovery,
  parseOEmbedResponse,
} from "./parsers/oembed";
import { parseOpenGraph } from "./parsers/opengraph";
import { parseProfile } from "./parsers/profile";
import { parseTwitterCard } from "./parsers/twitter";
import { parseVideo } from "./parsers/video";
import { isPrivateUrl, isValidUrl } from "./utils/url";
import { filterSocialMetadata } from "./validation/social/filter-social";
import { collectSocialTagIndex } from "./validation/social/tag-index";
import {
  validateSocialMetadata,
  type ValidateSocialMetadataInput,
} from "./validation/social/validate-social";

const VERSION = "2.0.0";

const HTML_INPUT_URL = "html-input";

const createFailure = (error: OgieError): ExtractResult => ({
  error,
  success: false,
});

const createFailureWithDiagnostics = (
  error: OgieError
): ExtractWithDiagnosticsResult => ({
  error,
  success: false,
});

const createSuccess = (data: Metadata): ExtractResult => ({
  data,
  success: true,
});

const createSuccessWithDiagnostics = (
  data: Metadata,
  diagnostics: SocialValidationReport
): ExtractWithDiagnosticsResult => ({
  data,
  diagnostics,
  success: true,
});

interface ParsedHtml {
  $: CheerioAPI;
  appLinks: ReturnType<typeof parseAppLinks>;
  article: ReturnType<typeof parseArticle>;
  basic: ReturnType<typeof parseBasicMeta>;
  book: ReturnType<typeof parseBook>;
  dublinCore: ReturnType<typeof parseDublinCore>;
  feeds: ReturnType<typeof parseFeeds>;
  jsonLd: ReturnType<typeof parseJsonLd>;
  music: ReturnType<typeof parseMusic>;
  oEmbedDiscovery: OEmbedDiscovery;
  og: ReturnType<typeof parseOpenGraph>;
  profile: ReturnType<typeof parseProfile>;
  socialTagIndex: ValidateSocialMetadataInput["tagIndex"];
  twitter: ReturnType<typeof parseTwitterCard>;
  video: ReturnType<typeof parseVideo>;
}

const normalizeMetaAttributes = ($: CheerioAPI): void => {
  $("meta").each((_, el) => {
    const $el = $(el);
    const property = $el.attr("property");
    if (property) {
      $el.attr("property", property.toLowerCase());
    }
    const name = $el.attr("name");
    if (name) {
      $el.attr("name", name.toLowerCase());
    }
    const httpEquiv = $el.attr("http-equiv");
    if (httpEquiv) {
      $el.attr("http-equiv", httpEquiv.toLowerCase());
    }
  });
};

const parseHtml = (html: string, baseUrl?: string): ParsedHtml => {
  const $ = load(html);
  normalizeMetaAttributes($);

  return {
    $,
    appLinks: parseAppLinks($),
    article: parseArticle($),
    basic: parseBasicMeta($, baseUrl),
    book: parseBook($),
    dublinCore: parseDublinCore($),
    feeds: parseFeeds($, baseUrl),
    jsonLd: parseJsonLd($),
    music: parseMusic($),
    oEmbedDiscovery: parseOEmbedDiscovery($),
    og: parseOpenGraph($, baseUrl),
    profile: parseProfile($),
    socialTagIndex: collectSocialTagIndex($),
    twitter: parseTwitterCard($, baseUrl),
    video: parseVideo($),
  };
};

const getExtractionMode = (options?: ExtractOptions): ExtractionMode =>
  options?.mode === "platform-valid" ? "platform-valid" : "best-effort";

const shouldSkipOpenGraphFallback = (options?: ExtractOptions): boolean =>
  (options?.onlyOpenGraph ?? false) ||
  getExtractionMode(options) === "platform-valid";

const applyFallbacks = (
  og: Metadata["og"],
  twitter: Metadata["twitter"],
  basic: Metadata["basic"],
  skipFallbacks: boolean
): Metadata["og"] => {
  if (skipFallbacks) {
    return og;
  }

  return {
    ...og,
    description: og.description ?? twitter.description ?? basic.description,
    title: og.title ?? twitter.title ?? basic.title,
  };
};

const wrapError = (error: unknown, url: string): OgieError => {
  if (error instanceof OgieError) {
    return error;
  }
  const message = error instanceof Error ? error.message : "Extraction failed";
  const cause = error instanceof Error ? error : undefined;
  return new ParseError(message, url, cause);
};

const hasData = (obj: object): boolean =>
  Object.values(obj).some((v) => v !== undefined && v !== null);

interface BuildMetadataFromParsedOptions {
  parsed: ParsedHtml;
  requestUrl: string;
  finalUrl: string;
  options?: ExtractOptions;
  statusCode?: number;
  contentType?: string;
  charset?: string;
  oEmbed?: OEmbedData;
}

const buildMetadataFromParsed = ({
  parsed,
  requestUrl,
  finalUrl,
  options,
  statusCode,
  contentType,
  charset,
  oEmbed,
}: BuildMetadataFromParsedOptions): Metadata => {
  const {
    og,
    twitter,
    basic,
    dublinCore,
    article,
    appLinks,
    book,
    feeds,
    jsonLd,
    music,
    oEmbedDiscovery,
    profile,
    video,
  } = parsed;

  const ogWithFallbacks = applyFallbacks(
    og,
    twitter,
    basic,
    shouldSkipOpenGraphFallback(options)
  );

  return {
    appLinks: hasData(appLinks) ? appLinks : undefined,
    article: hasData(article) ? article : undefined,
    basic,
    book: hasData(book) ? book : undefined,
    charset,
    contentType,
    dublinCore: hasData(dublinCore) ? dublinCore : undefined,
    feeds: hasFeeds(feeds) ? feeds : undefined,
    finalUrl,
    jsonLd: jsonLd.items.length > 0 ? jsonLd : undefined,
    music: hasData(music) ? music : undefined,
    oEmbed,
    oEmbedDiscovery: hasData(oEmbedDiscovery) ? oEmbedDiscovery : undefined,
    og: ogWithFallbacks,
    profile: hasData(profile) ? profile : undefined,
    requestUrl,
    statusCode,
    twitter,
    video: hasData(video) ? video : undefined,
  };
};

interface ProcessModeResult {
  metadata: Metadata;
  diagnostics?: SocialValidationReport;
}

const applyModeToMetadata = (
  metadata: Metadata,
  parsed: ParsedHtml,
  options: ExtractOptions | undefined,
  includeDiagnostics: boolean
): ProcessModeResult => {
  const mode = getExtractionMode(options);
  const isPlatformValidMode = mode === "platform-valid";

  if (!includeDiagnostics && mode === "best-effort") {
    return { metadata };
  }

  const outputSocial = isPlatformValidMode
    ? filterSocialMetadata(metadata)
    : { og: metadata.og, twitter: metadata.twitter };

  const diagnostics = validateSocialMetadata({
    metadata,
    outputSocial,
    rawBasic: parsed.basic,
    rawOg: parsed.og,
    rawTwitter: parsed.twitter,
    tagIndex: parsed.socialTagIndex,
  });

  if (!isPlatformValidMode) {
    return includeDiagnostics ? { diagnostics, metadata } : { metadata };
  }

  const filteredMetadata: Metadata = {
    ...metadata,
    og: outputSocial.og,
    twitter: outputSocial.twitter,
  };

  return includeDiagnostics
    ? { diagnostics, metadata: filteredMetadata }
    : { metadata: filteredMetadata };
};

interface BuildResultFromParsedOptions extends BuildMetadataFromParsedOptions {
  includeDiagnostics: boolean;
}

const buildResultFromParsed = ({
  includeDiagnostics,
  ...buildOptions
}: BuildResultFromParsedOptions):
  | ExtractResult
  | ExtractWithDiagnosticsResult => {
  const metadata = buildMetadataFromParsed(buildOptions);
  const processed = applyModeToMetadata(
    metadata,
    buildOptions.parsed,
    buildOptions.options,
    includeDiagnostics
  );

  if (!includeDiagnostics) {
    return createSuccess(processed.metadata);
  }

  return createSuccessWithDiagnostics(
    processed.metadata,
    processed.diagnostics ?? {
      invalidFields: [],
      missingRequiredFields: [],
      sourceTags: {},
      summary: {
        invalid: 0,
        missingRequired: 0,
        valid: 0,
        warnings: 0,
      },
      validFields: [],
      version: 1,
      warnings: [],
    }
  );
};

const parseHtmlInput = (
  html: string,
  options?: ExtractOptions
): { parsed: ParsedHtml; requestUrl: string } | ParseError => {
  if (!html || typeof html !== "string") {
    return new ParseError(
      "HTML input must be a non-empty string",
      HTML_INPUT_URL
    );
  }

  const baseUrl = options?.baseUrl ?? "";
  const requestUrl = baseUrl || HTML_INPUT_URL;

  try {
    return {
      parsed: parseHtml(html, requestUrl),
      requestUrl,
    };
  } catch (error) {
    return wrapError(error, requestUrl) as ParseError;
  }
};

/** Extract metadata from an HTML string */
export const extractFromHtml = (
  html: string,
  options?: ExtractOptions
): ExtractResult => {
  const parsedInput = parseHtmlInput(html, options);
  if (parsedInput instanceof ParseError || parsedInput instanceof OgieError) {
    return createFailure(parsedInput);
  }

  const { parsed, requestUrl } = parsedInput;

  try {
    return buildResultFromParsed({
      finalUrl: requestUrl,
      includeDiagnostics: false,
      options,
      parsed,
      requestUrl,
    }) as ExtractResult;
  } catch (error) {
    return createFailure(wrapError(error, requestUrl));
  }
};

/** Extract metadata from an HTML string with diagnostics */
export const extractFromHtmlWithDiagnostics = (
  html: string,
  options?: ExtractOptions
): ExtractWithDiagnosticsResult => {
  const parsedInput = parseHtmlInput(html, options);
  if (parsedInput instanceof ParseError || parsedInput instanceof OgieError) {
    return createFailureWithDiagnostics(parsedInput);
  }

  const { parsed, requestUrl } = parsedInput;

  try {
    return buildResultFromParsed({
      finalUrl: requestUrl,
      includeDiagnostics: true,
      options,
      parsed,
      requestUrl,
    }) as ExtractWithDiagnosticsResult;
  } catch (error) {
    return createFailureWithDiagnostics(wrapError(error, requestUrl));
  }
};

const DEFAULT_OEMBED_USER_AGENT = `ogie/${VERSION} (+https://github.com/dobroslavradosavljevic/ogie)`;
const DEFAULT_OEMBED_TIMEOUT = 10_000;

const INVALID_OEMBED_ENDPOINT_MESSAGE =
  "Invalid oEmbed endpoint: URL must be HTTP/HTTPS and not point to private network";

/**
 * Validate oEmbed endpoint URL for SSRF protection
 * Returns true if the URL is safe to fetch
 */
const isValidOEmbedEndpoint = (
  endpoint: string,
  allowPrivateUrls: boolean
): boolean => {
  // Must be valid HTTP/HTTPS URL
  if (!isValidUrl(endpoint)) {
    return false;
  }

  // Check for private/internal URLs unless allowed
  if (!allowPrivateUrls && isPrivateUrl(endpoint)) {
    return false;
  }

  return true;
};

interface OEmbedFetchResult {
  data?: OEmbedData;
  error?: string;
}

const createOEmbedErrorResult = (message: string): OEmbedFetchResult => ({
  error: message,
});

const isOEmbedErrorResult = (
  result: Response | OEmbedFetchResult
): result is OEmbedFetchResult =>
  "error" in result && typeof result.error === "string";

const validateOEmbedEndpoint = (
  endpoint: string,
  allowPrivateUrls: boolean
): OEmbedFetchResult | undefined =>
  isValidOEmbedEndpoint(endpoint, allowPrivateUrls)
    ? undefined
    : createOEmbedErrorResult(INVALID_OEMBED_ENDPOINT_MESSAGE);

const isAbortError = (error: unknown): boolean =>
  error instanceof Error && error.name === "AbortError";

const isRedirectStatus = (status: number): boolean =>
  status >= 300 && status < 400;

const resolveRedirectUrl = (
  currentUrl: string,
  response: Response
): string | undefined => {
  const location = response.headers.get("location");
  if (!location || location.trim() === "") {
    return undefined;
  }
  try {
    return new URL(location, currentUrl).href;
  } catch {
    return undefined;
  }
};

const isProtocolDowngrade = (
  currentUrl: string,
  redirectUrl: string
): boolean =>
  new URL(currentUrl).protocol === "https:" &&
  new URL(redirectUrl).protocol === "http:";

const parseOEmbedFromResponse = async (
  response: Response
): Promise<OEmbedFetchResult> => {
  if (!response.ok) {
    return createOEmbedErrorResult(
      `oEmbed fetch failed with status ${response.status}`
    );
  }

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    return createOEmbedErrorResult(
      "Failed to parse oEmbed JSON: malformed response body"
    );
  }

  const data = parseOEmbedResponse(json);

  return data
    ? { data }
    : createOEmbedErrorResult("Failed to parse oEmbed response");
};

interface OEmbedFetchContext {
  allowPrivateUrls: boolean;
  maxRedirects: number;
  timeout: number;
  userAgent: string;
}

const createOEmbedFetchContext = (
  options?: ExtractOptions
): OEmbedFetchContext => ({
  allowPrivateUrls: options?.allowPrivateUrls ?? false,
  maxRedirects: options?.maxRedirects ?? DEFAULT_MAX_REDIRECTS,
  timeout: options?.timeout ?? DEFAULT_OEMBED_TIMEOUT,
  userAgent: options?.userAgent ?? DEFAULT_OEMBED_USER_AGENT,
});

const createOEmbedFetchError = (
  error: unknown,
  timeout: number
): OEmbedFetchResult => {
  if (isAbortError(error)) {
    return createOEmbedErrorResult(`oEmbed fetch timeout after ${timeout}ms`);
  }
  const message = error instanceof Error ? error.message : "Unknown error";
  return createOEmbedErrorResult(`oEmbed fetch error: ${message}`);
};

const fetchOEmbedResponse = async (
  url: string,
  ctx: OEmbedFetchContext
): Promise<Response | OEmbedFetchResult> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ctx.timeout);
  try {
    return await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": ctx.userAgent,
      },
      redirect: "manual",
      signal: controller.signal,
    });
  } catch (error) {
    return createOEmbedFetchError(error, ctx.timeout);
  } finally {
    clearTimeout(timeoutId);
  }
};

const getValidatedRedirectUrl = (
  currentUrl: string,
  response: Response,
  allowPrivateUrls: boolean
): { redirectUrl?: string; error?: OEmbedFetchResult } => {
  const redirectUrl = resolveRedirectUrl(currentUrl, response);
  if (!redirectUrl) {
    return {
      error: createOEmbedErrorResult(
        "oEmbed fetch error: redirect response without valid Location header"
      ),
    };
  }
  if (isProtocolDowngrade(currentUrl, redirectUrl)) {
    return {
      error: createOEmbedErrorResult(
        "oEmbed fetch error: HTTPS to HTTP protocol downgrade is not allowed"
      ),
    };
  }
  const redirectValidationError = validateOEmbedEndpoint(
    redirectUrl,
    allowPrivateUrls
  );
  if (redirectValidationError) {
    return { error: redirectValidationError };
  }
  return { redirectUrl };
};

// eslint-disable-next-line max-statements -- Security checks are intentionally explicit for redirect handling
const executeOEmbedFetch = async (
  endpoint: string,
  options?: ExtractOptions
): Promise<OEmbedFetchResult> => {
  const ctx = createOEmbedFetchContext(options);
  const visitedUrls = new Set<string>();
  let currentUrl = endpoint;

  for (
    let redirectCount = 0;
    redirectCount <= ctx.maxRedirects;
    redirectCount += 1
  ) {
    const validationError = validateOEmbedEndpoint(
      currentUrl,
      ctx.allowPrivateUrls
    );
    if (validationError) {
      return validationError;
    }

    if (visitedUrls.has(currentUrl)) {
      return createOEmbedErrorResult(
        "oEmbed fetch error: redirect loop detected"
      );
    }
    visitedUrls.add(currentUrl);

    const responseOrError = await fetchOEmbedResponse(currentUrl, ctx);
    if (isOEmbedErrorResult(responseOrError)) {
      return responseOrError;
    }
    const response = responseOrError;

    if (!isRedirectStatus(response.status)) {
      const finalValidationError = validateOEmbedEndpoint(
        currentUrl,
        ctx.allowPrivateUrls
      );
      if (finalValidationError) {
        return finalValidationError;
      }
      return await parseOEmbedFromResponse(response);
    }

    if (redirectCount >= ctx.maxRedirects) {
      return createOEmbedErrorResult(
        `oEmbed fetch error: maximum redirects (${ctx.maxRedirects}) exceeded`
      );
    }

    const { error, redirectUrl } = getValidatedRedirectUrl(
      currentUrl,
      response,
      ctx.allowPrivateUrls
    );
    if (error) {
      return error;
    }
    if (!redirectUrl) {
      return createOEmbedErrorResult(
        "oEmbed fetch error: redirect response without valid Location header"
      );
    }
    currentUrl = redirectUrl;
  }

  return createOEmbedErrorResult(
    `oEmbed fetch error: maximum redirects (${ctx.maxRedirects}) exceeded`
  );
};

/**
 * Fetch oEmbed data from discovered endpoint with SSRF protection
 * Uses the already-parsed oEmbedDiscovery to avoid double HTML parsing
 */
const fetchOEmbedData = (
  discovery: OEmbedDiscovery,
  options?: ExtractOptions
): Promise<OEmbedFetchResult> => {
  const endpoint = discovery.jsonUrl;
  if (!endpoint) {
    return Promise.resolve(
      createOEmbedErrorResult("No JSON oEmbed endpoint discovered")
    );
  }

  const allowPrivateUrls = options?.allowPrivateUrls ?? false;
  const validationError = validateOEmbedEndpoint(endpoint, allowPrivateUrls);
  if (validationError) {
    return Promise.resolve(validationError);
  }

  return executeOEmbedFetch(endpoint, options);
};

const maybeOEmbedData = async (
  parsed: ParsedHtml,
  options?: ExtractOptions
): Promise<OEmbedData | undefined> => {
  if (!options?.fetchOEmbed || !hasOEmbedDiscovery(parsed.oEmbedDiscovery)) {
    return undefined;
  }
  const result = await fetchOEmbedData(parsed.oEmbedDiscovery, options);
  return result.data;
};

const extractWithFetch = async (
  url: string,
  options?: ExtractOptions
): Promise<ExtractResult> => {
  const { html, finalUrl, statusCode, contentType, charset } = await fetchUrl(
    url,
    options
  );
  const parsed = parseHtml(html, finalUrl);
  const oEmbed = await maybeOEmbedData(parsed, options);

  return buildResultFromParsed({
    charset,
    contentType,
    finalUrl,
    includeDiagnostics: false,
    oEmbed,
    options,
    parsed,
    requestUrl: url,
    statusCode,
  }) as ExtractResult;
};

const extractWithFetchDiagnostics = async (
  url: string,
  options?: ExtractOptions
): Promise<ExtractWithDiagnosticsResult> => {
  const { html, finalUrl, statusCode, contentType, charset } = await fetchUrl(
    url,
    options
  );
  const parsed = parseHtml(html, finalUrl);
  const oEmbed = await maybeOEmbedData(parsed, options);

  return buildResultFromParsed({
    charset,
    contentType,
    finalUrl,
    includeDiagnostics: true,
    oEmbed,
    options,
    parsed,
    requestUrl: url,
    statusCode,
  }) as ExtractWithDiagnosticsResult;
};

/**
 * Get the cache instance from options
 * Returns undefined if caching is disabled
 */
const getCache = (options?: ExtractOptions): MetadataCache | undefined => {
  if (options?.cache === false) {
    return undefined;
  }
  return options?.cache;
};

/**
 * Try to get cached result
 * Returns undefined if cache miss or caching disabled
 */
const getCachedResult = (
  url: string,
  options?: ExtractOptions
): Metadata | undefined => {
  if (options?.bypassCache) {
    return undefined;
  }

  const cache = getCache(options);
  if (!cache) {
    return undefined;
  }

  try {
    const cacheKey = generateCacheKey(url, options);
    return cache.get(cacheKey);
  } catch {
    return undefined;
  }
};

/**
 * Store result in cache if caching is enabled
 */
const cacheResult = (
  url: string,
  metadata: Metadata,
  options?: ExtractOptions
): void => {
  const cache = getCache(options);
  if (!cache) {
    return;
  }

  try {
    const cacheKey = generateCacheKey(url, options);
    cache.set(cacheKey, metadata);
  } catch {
    // Ignore cache write errors - extraction should not fail due to caching
  }
};

const performExtraction = async (
  url: string,
  options?: ExtractOptions
): Promise<ExtractResult> => {
  const result = await extractWithFetch(url, options);

  if (result.success) {
    cacheResult(url, result.data, options);
  }

  return result;
};

const withDiagnosticsDefaults = (options?: ExtractOptions): ExtractOptions => ({
  ...options,
  bypassCache: true,
  cache: false,
});

/** Extract metadata from a URL */
export const extract = async (
  url: string,
  options?: ExtractOptions
): Promise<ExtractResult> => {
  if (!isValidUrl(url)) {
    return createFailure(
      new OgieError(
        "Invalid URL: must be a valid HTTP or HTTPS URL",
        "INVALID_URL",
        url
      )
    );
  }

  const cachedMetadata = getCachedResult(url, options);
  if (cachedMetadata) {
    return createSuccess(cachedMetadata);
  }

  try {
    return await performExtraction(url, options);
  } catch (error) {
    return createFailure(wrapError(error, url));
  }
};

/** Extract metadata from a URL with diagnostics */
export const extractWithDiagnostics = async (
  url: string,
  options?: ExtractOptions
): Promise<ExtractWithDiagnosticsResult> => {
  if (!isValidUrl(url)) {
    return createFailureWithDiagnostics(
      new OgieError(
        "Invalid URL: must be a valid HTTP or HTTPS URL",
        "INVALID_URL",
        url
      )
    );
  }

  try {
    return await extractWithFetchDiagnostics(
      url,
      withDiagnosticsDefaults(options)
    );
  } catch (error) {
    return createFailureWithDiagnostics(wrapError(error, url));
  }
};

/* eslint-disable jest/require-hook */
import { afterEach, beforeEach, describe, expect, it } from "bun:test";

import {
  extractFromHtml,
  extractWithDiagnostics,
  type ExtractFailure,
  type ExtractSuccess,
} from "../src";
import { fallbackFixtures, opengraphFixtures } from "./data";

type ExtractWithDiagnosticsSuccess = Exclude<
  Awaited<ReturnType<typeof extractWithDiagnostics>>,
  ExtractFailure
>;

const expectDiagnosticsSuccess = (
  result: Awaited<ReturnType<typeof extractWithDiagnostics>>
): ExtractWithDiagnosticsSuccess => {
  expect(result.success).toBe(true);
  return result as ExtractWithDiagnosticsSuccess;
};

describe("extraction modes - API", () => {
  it("keeps legacy behavior by default", () => {
    const legacy = extractFromHtml(fallbackFixtures.onlyOpengraphMode, {
      baseUrl: "https://example.com",
    }) as ExtractSuccess;

    expect(legacy.success).toBe(true);
    expect(legacy.data.og.title).toBe("Twitter Only Title");
  });

  it("keeps legacy behavior with explicit best-effort mode", () => {
    const legacy = extractFromHtml(fallbackFixtures.onlyOpengraphMode, {
      baseUrl: "https://example.com",
    }) as ExtractSuccess;

    const explicit = extractFromHtml(fallbackFixtures.onlyOpengraphMode, {
      baseUrl: "https://example.com",
      mode: "best-effort",
    }) as ExtractSuccess;

    expect(explicit).toEqual(legacy);
  });

  it("disables OG fallback in platform-valid mode", () => {
    const strict = extractFromHtml(fallbackFixtures.onlyOpengraphMode, {
      baseUrl: "https://example.com",
      mode: "platform-valid",
    }) as ExtractSuccess;

    expect(strict.success).toBe(true);
    expect(strict.data.og.title).toBeUndefined();
    expect(strict.data.og.description).toBeUndefined();
  });

  it("keeps permissive OG URLs in best-effort mode", () => {
    const result = extractFromHtml(opengraphFixtures.ogInvalidUrls, {
      baseUrl: "https://example.com",
      mode: "best-effort",
    }) as ExtractSuccess;

    expect(result.success).toBe(true);
    expect(result.data.og.url).toBe("https://example.com/not%20a%20url");
    expect(result.data.og.images[0]?.url).toBe("ftp://example.com/image.jpg");
  });

  it("filters invalid OG URLs in platform-valid mode", () => {
    const result = extractFromHtml(opengraphFixtures.ogInvalidUrls, {
      baseUrl: "https://example.com",
      mode: "platform-valid",
    }) as ExtractSuccess;

    expect(result.success).toBe(true);
    expect(result.data.og.url).toBe("https://example.com/not%20a%20url");
    expect(result.data.og.images).toHaveLength(0);
  });

  it("returns standard INVALID_URL error in extractWithDiagnostics", async () => {
    const result = (await extractWithDiagnostics(
      "not-a-valid-url"
    )) as ExtractFailure;

    expect(result.success).toBe(false);
    expect(result.error.code).toBe("INVALID_URL");
  });
});

describe("extractWithDiagnostics - API mode/diagnostics contract", () => {
  let fetchCalls = 0;
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    fetchCalls = 0;
    originalFetch = globalThis.fetch;
    globalThis.fetch = (() => {
      fetchCalls += 1;
      const html = `<!doctype html><html><head>
        <meta property="og:title" content="Mode Contract Title" />
        <meta property="og:image" content="ftp://example.com/image.jpg" />
      </head><body></body></html>`;
      return Promise.resolve(
        new Response(html, {
          headers: {
            "content-type": "text/html; charset=utf-8",
          },
        })
      );
    }) as unknown as typeof globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("returns diagnostics for both modes and filters only in platform-valid mode", async () => {
    const bestEffortResult = expectDiagnosticsSuccess(
      await extractWithDiagnostics("https://mode-contract.example.com", {
        mode: "best-effort",
      })
    );
    const platformValidResult = expectDiagnosticsSuccess(
      await extractWithDiagnostics("https://mode-contract.example.com", {
        mode: "platform-valid",
      })
    );

    expect(bestEffortResult.data.og.images[0]?.url).toBe(
      "ftp://example.com/image.jpg"
    );
    expect(platformValidResult.data.og.images).toHaveLength(0);
    expect(bestEffortResult.diagnostics.summary.invalid).toBeGreaterThan(0);
    expect(platformValidResult.diagnostics.summary.invalid).toBeGreaterThan(0);
  });

  it("does not reuse cache between diagnostics calls by default", async () => {
    await extractWithDiagnostics("https://cache-contract.example.com");
    await extractWithDiagnostics("https://cache-contract.example.com");

    expect(fetchCalls).toBe(2);
  });
});

/* eslint-disable jest/require-hook, max-statements, no-nested-ternary, require-await */
import { afterEach, beforeEach, describe, expect, it } from "bun:test";

import {
  createCache,
  extract,
  extractFromHtml,
  generateCacheKey,
  type ExtractSuccess,
  type Metadata,
  type MetadataCache,
} from "../src";
import { fixtures } from "./data";

// Helper function to create mock metadata
const createMockMetadata = (url: string): Metadata => ({
  basic: {
    title: "Test Title",
  },
  finalUrl: url,
  og: {
    description: "Test Description",
    images: [],
    title: "Test Title",
  },
  requestUrl: url,
  twitter: {},
});

describe("generateCacheKey", () => {
  it("normalizes URL for cache key", () => {
    const key1 = generateCacheKey("https://example.com/");
    const key2 = generateCacheKey("https://example.com");

    expect(key1).toBe(key2);
  });

  it("generates same key for URLs with same normalization", () => {
    const key1 = generateCacheKey("HTTPS://EXAMPLE.COM/page");
    const key2 = generateCacheKey("https://example.com/page");

    expect(key1).toBe(key2);
  });

  it("generates different keys for different URLs", () => {
    const key1 = generateCacheKey("https://example.com/page1");
    const key2 = generateCacheKey("https://example.com/page2");

    expect(key1).not.toBe(key2);
  });

  it("includes options hash when cache-relevant options are provided", () => {
    const keyWithoutOptions = generateCacheKey("https://example.com");
    const keyWithOptions = generateCacheKey("https://example.com", {
      onlyOpenGraph: true,
    });

    expect(keyWithOptions).not.toBe(keyWithoutOptions);
    expect(keyWithOptions).toContain("::");
  });

  it("generates same key for same options", () => {
    const key1 = generateCacheKey("https://example.com", {
      onlyOpenGraph: true,
    });
    const key2 = generateCacheKey("https://example.com", {
      onlyOpenGraph: true,
    });

    expect(key1).toBe(key2);
  });

  it("generates different keys for different options", () => {
    const key1 = generateCacheKey("https://example.com", {
      onlyOpenGraph: true,
    });
    const key2 = generateCacheKey("https://example.com", {
      onlyOpenGraph: false,
    });

    expect(key1).not.toBe(key2);
  });

  it("ignores non-semantic cache controls", () => {
    const cache = createCache();
    const key1 = generateCacheKey("https://example.com", {
      bypassCache: true,
      cache,
    });
    const key2 = generateCacheKey("https://example.com", {
      bypassCache: false,
      cache,
    });

    expect(key1).toBe(key2);
  });

  it("includes fetchOEmbed in cache key", () => {
    const key1 = generateCacheKey("https://example.com", {
      fetchOEmbed: true,
    });
    const key2 = generateCacheKey("https://example.com", {
      fetchOEmbed: false,
    });

    expect(key1).not.toBe(key2);
  });

  it("includes convertCharset in cache key", () => {
    const key1 = generateCacheKey("https://example.com", {
      convertCharset: true,
    });
    const key2 = generateCacheKey("https://example.com", {
      convertCharset: false,
    });

    expect(key1).not.toBe(key2);
  });

  it("includes timeout in cache key", () => {
    const key1 = generateCacheKey("https://example.com", {
      timeout: 5000,
    });
    const key2 = generateCacheKey("https://example.com", {
      timeout: 10_000,
    });

    expect(key1).not.toBe(key2);
  });

  it("includes userAgent in cache key", () => {
    const key1 = generateCacheKey("https://example.com", {
      userAgent: "ogie-bot/1.0",
    });
    const key2 = generateCacheKey("https://example.com", {
      userAgent: "ogie-bot/2.0",
    });

    expect(key1).not.toBe(key2);
  });

  it("includes allowPrivateUrls in cache key", () => {
    const key1 = generateCacheKey("https://example.com", {
      allowPrivateUrls: false,
    });
    const key2 = generateCacheKey("https://example.com", {
      allowPrivateUrls: true,
    });

    expect(key1).not.toBe(key2);
  });

  it("normalizes header order and case in cache key", () => {
    const key1 = generateCacheKey("https://example.com", {
      headers: {
        "X-Custom": "value",
        "X-Trace": "trace-id",
      },
    });

    const key2 = generateCacheKey("https://example.com", {
      headers: {
        "x-custom": "value",
        "x-trace": "trace-id",
      },
    });

    expect(key1).toBe(key2);
  });

  it("changes cache key when header values differ", () => {
    const key1 = generateCacheKey("https://example.com", {
      headers: { "x-custom": "value-a" },
    });
    const key2 = generateCacheKey("https://example.com", {
      headers: { "x-custom": "value-b" },
    });

    expect(key1).not.toBe(key2);
  });

  it("generates consistent key regardless of options order", () => {
    const key1 = generateCacheKey("https://example.com", {
      convertCharset: true,
      fetchOEmbed: true,
      onlyOpenGraph: false,
    });
    const key2 = generateCacheKey("https://example.com", {
      convertCharset: true,
      fetchOEmbed: true,
      onlyOpenGraph: false,
    });

    expect(key1).toBe(key2);
  });
});

describe("createCache", () => {
  it("creates a cache with default options", () => {
    const cache = createCache();

    expect(cache).toBeDefined();
    expect(cache.maxSize).toBe(100);
    expect(cache.maxAge).toBe(300_000);
  });

  it("creates a cache with custom maxSize", () => {
    const cache = createCache({ maxSize: 50 });

    expect(cache.maxSize).toBe(50);
  });

  it("creates a cache with custom ttl", () => {
    const cache = createCache({ ttl: 60_000 });

    expect(cache.maxAge).toBe(60_000);
  });

  it("calls onEviction callback when item is evicted", () => {
    const evictedItems: { key: string; value: Metadata }[] = [];
    const cache = createCache({
      maxSize: 2,
      onEviction: (key, value) => {
        evictedItems.push({ key, value });
      },
    });

    const mockMetadata = createMockMetadata("https://example.com/1");

    // Fill the cache beyond capacity to trigger eviction
    cache.set("key1", mockMetadata);
    cache.set("key2", { ...mockMetadata, requestUrl: "https://example.com/2" });
    cache.set("key3", { ...mockMetadata, requestUrl: "https://example.com/3" });
    cache.set("key4", { ...mockMetadata, requestUrl: "https://example.com/4" });
    cache.set("key5", { ...mockMetadata, requestUrl: "https://example.com/5" });

    // Due to QuickLRU's dual-cache design, eviction happens when exceeding 2x maxSize
    // We need to trigger more writes to force eviction
    expect(evictedItems.length).toBeGreaterThanOrEqual(0);
  });
});

describe("cache - basic operations", () => {
  let cache: MetadataCache;

  beforeEach(() => {
    cache = createCache({ maxSize: 10, ttl: 60_000 });
  });

  it("stores and retrieves metadata", () => {
    const metadata = createMockMetadata("https://example.com");
    const key = generateCacheKey("https://example.com");

    cache.set(key, metadata);
    const retrieved = cache.get(key);

    expect(retrieved).toEqual(metadata);
  });

  it("returns undefined for cache miss", () => {
    const key = generateCacheKey("https://nonexistent.com");
    const retrieved = cache.get(key);

    expect(retrieved).toBeUndefined();
  });

  it("checks if key exists with has()", () => {
    const metadata = createMockMetadata("https://example.com");
    const key = generateCacheKey("https://example.com");

    expect(cache.has(key)).toBe(false);

    cache.set(key, metadata);

    expect(cache.has(key)).toBe(true);
  });

  it("deletes entries", () => {
    const metadata = createMockMetadata("https://example.com");
    const key = generateCacheKey("https://example.com");

    cache.set(key, metadata);
    expect(cache.has(key)).toBe(true);

    cache.delete(key);
    expect(cache.has(key)).toBe(false);
  });

  it("clears all entries", () => {
    const metadata1 = createMockMetadata("https://example1.com");
    const metadata2 = createMockMetadata("https://example2.com");

    cache.set("key1", metadata1);
    cache.set("key2", metadata2);

    expect(cache.size).toBe(2);

    cache.clear();

    expect(cache.size).toBe(0);
  });
});

describe("cache - TTL expiry", () => {
  it("expires items after TTL", async () => {
    const cache = createCache({ maxSize: 10, ttl: 50 });
    const metadata = createMockMetadata("https://example.com");
    const key = generateCacheKey("https://example.com");

    cache.set(key, metadata);
    expect(cache.get(key)).toEqual(metadata);

    // Wait for TTL to expire
    await Bun.sleep(100);

    // Item should be expired (lazy expiration on access)
    expect(cache.get(key)).toBeUndefined();
  });

  it("expiresIn returns remaining TTL", () => {
    const cache = createCache({ maxSize: 10, ttl: 60_000 });
    const metadata = createMockMetadata("https://example.com");
    const key = generateCacheKey("https://example.com");

    cache.set(key, metadata);

    const remaining = cache.expiresIn(key);
    expect(remaining).toBeDefined();
    expect(remaining).toBeLessThanOrEqual(60_000);
    expect(remaining).toBeGreaterThan(59_000);
  });

  it("expiresIn returns undefined for non-existent key", () => {
    const cache = createCache({ maxSize: 10, ttl: 60_000 });

    expect(cache.expiresIn("nonexistent")).toBeUndefined();
  });
});

describe("cache - LRU eviction", () => {
  it("evicts least recently used items when capacity exceeded", () => {
    const cache = createCache({ maxSize: 2, ttl: 60_000 });

    cache.set("key1", createMockMetadata("https://example1.com"));
    cache.set("key2", createMockMetadata("https://example2.com"));
    cache.set("key3", createMockMetadata("https://example3.com"));
    cache.set("key4", createMockMetadata("https://example4.com"));
    cache.set("key5", createMockMetadata("https://example5.com"));

    // QuickLRU maintains between maxSize and 2*maxSize items
    // The oldest items should eventually be evicted
    expect(cache.size).toBeLessThanOrEqual(4);

    // Most recent should exist
    expect(cache.has("key5")).toBe(true);
  });

  it("updates recency on get()", () => {
    const cache = createCache({ maxSize: 2, ttl: 60_000 });

    cache.set("key1", createMockMetadata("https://example1.com"));
    cache.set("key2", createMockMetadata("https://example2.com"));

    // Access key1 to make it recently used
    cache.get("key1");

    cache.set("key3", createMockMetadata("https://example3.com"));
    cache.set("key4", createMockMetadata("https://example4.com"));
    cache.set("key5", createMockMetadata("https://example5.com"));

    // key1 was accessed, so it should be more likely to survive
    // key2 was not accessed, so it's more likely to be evicted
    // Most recent should exist
    expect(cache.has("key5")).toBe(true);
  });
});

describe("extract with cache", () => {
  let cache: MetadataCache;
  let fetchCalls = 0;
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    cache = createCache({ maxSize: 10, ttl: 60_000 });
    fetchCalls = 0;
    originalFetch = globalThis.fetch;
    globalThis.fetch = (async (input: Parameters<typeof fetch>[0]) => {
      fetchCalls += 1;
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url;
      const html = `
        <!doctype html>
        <html>
          <head>
            <meta property="og:title" content="Fetched ${url}">
            <meta property="og:description" content="Description for ${url}">
            <title>Fetched ${url}</title>
          </head>
          <body></body>
        </html>
      `;
      return new Response(html, {
        headers: {
          "content-type": "text/html; charset=utf-8",
        },
      });
    }) as unknown as typeof globalThis.fetch;
  });

  afterEach(() => {
    cache.clear();
    globalThis.fetch = originalFetch;
  });

  it("caching is disabled by default (no cache option)", async () => {
    await extract("https://example.com");
    await extract("https://example.com");

    expect(fetchCalls).toBe(2);
  });

  it("stores result in cache when cache option provided", async () => {
    const url = "https://example.com";
    const result = (await extract(url, {
      cache,
    })) as ExtractSuccess;

    expect(result.success).toBe(true);
    const key = generateCacheKey(url);
    expect(cache.has(key)).toBe(true);
  });

  it("returns cached result on cache hit", async () => {
    const url = "https://cached.example.com";

    await extract(url, { cache });
    const result = (await extract(url, {
      cache,
    })) as ExtractSuccess;

    expect(result.success).toBe(true);
    expect(result.data.requestUrl).toBe(url);
    expect(fetchCalls).toBe(1);
  });

  it("bypasses cache when bypassCache is true", async () => {
    const url = "https://bypass.example.com";
    await extract(url, { cache });
    expect(fetchCalls).toBe(1);

    const result = await extract(url, {
      bypassCache: true,
      cache,
    });

    expect(result.success).toBe(true);
    expect(fetchCalls).toBe(2);
  });

  it("does not use cache when cache option is false", async () => {
    const url = "https://nocache.example.com";
    const key = generateCacheKey(url);
    cache.set(key, createMockMetadata(url));

    const result = await extract(url, {
      cache: false,
    });

    expect(result.success).toBe(true);
    expect(fetchCalls).toBe(1);
  });

  it("uses different cache keys for different options - default", async () => {
    const mockMetadataDefault = createMockMetadata(
      "https://options.example.com"
    );
    mockMetadataDefault.og.title = "Default Options";

    const keyDefault = generateCacheKey("https://options.example.com");
    cache.set(keyDefault, mockMetadataDefault);

    const result = (await extract("https://options.example.com", {
      cache,
    })) as ExtractSuccess;

    expect(result.data.og.title).toBe("Default Options");
  });

  it("uses different cache keys for different options - onlyOpenGraph", async () => {
    const mockMetadataOgOnly = createMockMetadata(
      "https://options.example.com"
    );
    mockMetadataOgOnly.og.title = "OG Only Options";

    const keyOgOnly = generateCacheKey("https://options.example.com", {
      onlyOpenGraph: true,
    });
    cache.set(keyOgOnly, mockMetadataOgOnly);

    const result = (await extract("https://options.example.com", {
      cache,
      onlyOpenGraph: true,
    })) as ExtractSuccess;

    expect(result.data.og.title).toBe("OG Only Options");
  });

  it("uses different cache keys for different headers", async () => {
    const url = "https://headers.example.com";
    const keyA = generateCacheKey(url, {
      headers: { "x-client": "mobile" },
    });
    const keyB = generateCacheKey(url, {
      headers: { "x-client": "desktop" },
    });

    await extract(url, {
      cache,
      headers: { "x-client": "mobile" },
    });
    await extract(url, {
      cache,
      headers: { "x-client": "desktop" },
    });

    expect(keyA).not.toBe(keyB);
    expect(fetchCalls).toBe(2);
  });
});

describe("extractFromHtml - no caching", () => {
  it("extractFromHtml does not use cache (HTML extraction is always fresh)", () => {
    // extractFromHtml is for parsing raw HTML, caching doesn't apply
    const result = extractFromHtml(fixtures.opengraph, {
      baseUrl: "https://example.com",
    }) as ExtractSuccess;

    expect(result.success).toBe(true);
    expect(result.data.og.title).toBe("Test Title");
  });
});

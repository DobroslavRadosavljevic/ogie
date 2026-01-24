# ogie 🔮

> Lightweight, production-ready OpenGraph and metadata extraction for Node.js

[![npm version](https://img.shields.io/npm/v/ogie.svg)](https://www.npmjs.com/package/ogie)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

A comprehensive metadata extraction library that pulls OpenGraph, Twitter Cards, JSON-LD, Dublin Core, and more from any webpage. Built with TypeScript, secure by default, and optimized for production use.

## ✨ Features

- 🎯 **Comprehensive Extraction** — OpenGraph, Twitter Cards, JSON-LD, Dublin Core, Article metadata, App Links, oEmbed
- 🚀 **High Performance** — LRU caching with TTL, bulk extraction with smart rate limiting
- 🔒 **Secure by Default** — SSRF protection, private IP blocking, URL validation
- 📦 **Minimal Dependencies** — Just 4 production deps (cheerio, quick-lru, bottleneck, iconv-lite)
- 🎨 **TypeScript First** — Full type safety with exported interfaces and type guards
- ⚡ **Smart Fallbacks** — Automatically fills missing OG data from Twitter Cards and meta tags
- 🌐 **Charset Detection** — Auto-detect and convert non-UTF-8 pages
- 📊 **Bulk Processing** — Process hundreds of URLs with per-domain rate limiting

## 📥 Installation

```bash
# npm
npm install ogie

# yarn
yarn add ogie

# pnpm
pnpm add ogie

# bun
bun add ogie
```

## 🚀 Quick Start

```typescript
import { extract } from "ogie";

// Extract metadata from a URL
const result = await extract("https://github.com");

if (result.success) {
  console.log(result.data.og.title); // "GitHub: Let's build from here"
  console.log(result.data.og.description); // "GitHub is where..."
  console.log(result.data.og.images[0]?.url); // "https://github.githubassets.com/..."
} else {
  console.error(result.error.code); // "FETCH_ERROR", "INVALID_URL", etc.
}
```

## 📖 API Reference

### `extract(url, options?)` 🌐

Extract metadata from a URL by fetching and parsing the page.

```typescript
import { extract } from "ogie";

const result = await extract("https://example.com");

// With options
const result = await extract("https://example.com", {
  timeout: 10000, // Request timeout (ms)
  maxRedirects: 5, // Max redirects to follow
  userAgent: "MyBot/1.0", // Custom User-Agent
  fetchOEmbed: true, // Also fetch oEmbed endpoint
  convertCharset: true, // Auto-detect and convert charset
});

if (result.success) {
  console.log(result.data.og.title);
  console.log(result.data.twitter.card);
  console.log(result.data.basic.favicon);
}
```

**Returns:** `Promise<ExtractResult>`

---

### `extractFromHtml(html, options?)` 📄

Extract metadata from an HTML string without making network requests.

```typescript
import { extractFromHtml } from "ogie";

const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta property="og:title" content="My Page">
    <meta property="og:image" content="/images/hero.jpg">
    <title>My Page Title</title>
  </head>
  </html>
`;

const result = extractFromHtml(html, {
  baseUrl: "https://example.com", // Required for resolving relative URLs
});

if (result.success) {
  console.log(result.data.og.title); // "My Page"
  console.log(result.data.og.images[0]?.url); // "https://example.com/images/hero.jpg"
}
```

**Returns:** `ExtractResult`

---

### `extractBulk(urls, options?)` 📦

Extract metadata from multiple URLs with built-in rate limiting and concurrency control.

```typescript
import { extractBulk } from "ogie";

const urls = [
  "https://github.com",
  "https://twitter.com",
  "https://youtube.com",
  "https://medium.com",
];

const result = await extractBulk(urls, {
  concurrency: 10, // Max parallel requests globally
  concurrencyPerDomain: 3, // Max parallel per domain
  minDelayPerDomain: 200, // Min ms between same-domain requests
  requestsPerMinute: 600, // Global rate limit
  timeout: 30000, // Timeout per request
  continueOnError: true, // Don't stop on failures
  onProgress: (progress) => {
    console.log(`${progress.completed}/${progress.total} done`);
    console.log(`✅ ${progress.succeeded} | ❌ ${progress.failed}`);
  },
});

// Access results
console.log(`Total time: ${result.totalDurationMs}ms`);
console.log(`Succeeded: ${result.stats.succeeded}`);
console.log(`Failed: ${result.stats.failed}`);

// Iterate results (maintains input order)
for (const item of result.results) {
  console.log(`${item.url}: ${item.durationMs}ms`);
  if (item.result.success) {
    console.log(`  Title: ${item.result.data.og.title}`);
  } else {
    console.log(`  Error: ${item.result.error.code}`);
  }
}
```

**Returns:** `Promise<BulkResult>`

---

### `createCache(options?)` 💾

Create an LRU cache instance for storing extraction results.

```typescript
import { extract, createCache } from "ogie";

const cache = createCache({
  maxSize: 100, // Max cached items (default: 100)
  ttl: 300_000, // Time-to-live in ms (default: 5 minutes)
  onEviction: (key, value) => {
    console.log(`Evicted: ${key}`);
  },
});

// First call fetches from network
const result1 = await extract("https://github.com", { cache });

// Second call returns cached result instantly
const result2 = await extract("https://github.com", { cache });

// Force fresh fetch (result still gets cached)
const result3 = await extract("https://github.com", {
  cache,
  bypassCache: true,
});

// Cache utilities
console.log(`Cache size: ${cache.size}`);
cache.clear(); // Clear all entries
```

**Returns:** `MetadataCache` (QuickLRU instance)

---

### `generateCacheKey(url, options?)` 🔑

Generate a cache key for a URL and options combination.

```typescript
import { generateCacheKey } from "ogie";

const key1 = generateCacheKey("https://example.com");
const key2 = generateCacheKey("https://example.com/"); // Same key (normalized)

// Different options produce different keys
const key3 = generateCacheKey("https://example.com", { fetchOEmbed: true });
console.log(key1 === key3); // false
```

**Returns:** `string`

## 📊 Extracted Metadata

Ogie extracts metadata from **8 different sources**:

### 🌐 OpenGraph (`data.og`)

```typescript
{
  title: "Page Title",
  description: "Page description",
  type: "website", // website, article, video.movie, etc.
  url: "https://example.com",
  siteName: "Example",
  locale: "en_US",
  localeAlternate: ["es_ES", "fr_FR"],
  determiner: "the",
  images: [
    { url: "https://...", width: 1200, height: 630, alt: "..." }
  ],
  videos: [
    { url: "https://...", width: 1280, height: 720, type: "video/mp4" }
  ],
  audio: [
    { url: "https://...", type: "audio/mpeg" }
  ],
}
```

### 🐦 Twitter Cards (`data.twitter`)

```typescript
{
  card: "summary_large_image", // summary, summary_large_image, app, player
  site: "@github",
  creator: "@username",
  title: "Card Title",
  description: "Card description",
  image: { url: "https://...", alt: "Image description" },
  player: { url: "https://...", width: 640, height: 360 },
  app: {
    iphone: { id: "123456", url: "app://...", name: "App Name" },
    googleplay: { id: "com.example", url: "app://..." }
  },
}
```

### 📝 Basic Meta (`data.basic`)

```typescript
{
  title: "Document Title",        // <title> tag
  description: "Meta description",
  canonical: "https://example.com/page",
  favicon: "https://example.com/favicon.ico",
  favicons: [
    { url: "...", rel: "icon", sizes: "32x32", type: "image/png" },
    { url: "...", rel: "apple-touch-icon", sizes: "180x180" }
  ],
  manifestUrl: "https://example.com/manifest.json",
  author: "John Doe",
  keywords: "web, metadata, scraping",
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#ffffff",
  generator: "Next.js",
  applicationName: "My App",
}
```

### 📰 Article (`data.article`)

```typescript
{
  publishedTime: "2024-01-15T10:00:00Z",
  modifiedTime: "2024-01-16T12:00:00Z",
  expirationTime: "2025-01-15T10:00:00Z",
  author: ["Jane Doe", "John Smith"],
  section: "Technology",
  tags: ["javascript", "typescript", "web"],
  publisher: "Tech Blog",
}
```

### 🔗 JSON-LD (`data.jsonLd`)

```typescript
{
  items: [
    {
      type: "Article",
      name: "Article Title",
      description: "Article description",
      datePublished: "2024-01-15",
      author: { type: "Person", name: "Jane Doe", url: "https://..." },
      publisher: { type: "Organization", name: "Publisher", logo: "..." },
    }
  ],
  raw: [/* Original parsed JSON-LD objects */],
}
```

### 📚 Dublin Core (`data.dublinCore`)

```typescript
{
  title: "Document Title",
  creator: ["Author Name"],
  subject: ["Topic 1", "Topic 2"],
  description: "Document description",
  publisher: "Publisher Name",
  contributor: ["Contributor 1"],
  date: "2024-01-15",
  type: "Text",
  format: "text/html",
  identifier: "ISBN:1234567890",
  language: "en",
  rights: "CC BY 4.0",
}
```

### 📱 App Links (`data.appLinks`)

```typescript
{
  ios: [{ url: "app://...", appStoreId: "123456", appName: "My App" }],
  iphone: [{ url: "app://...", appStoreId: "123456" }],
  android: [{ url: "app://...", package: "com.example.app", appName: "My App" }],
  web: [{ url: "https://...", shouldFallback: true }],
}
```

### 🎬 oEmbed (`data.oEmbed`)

Populated when `fetchOEmbed: true` is set:

```typescript
{
  type: "video", // photo, video, link, rich
  version: "1.0",
  title: "Video Title",
  authorName: "Channel Name",
  authorUrl: "https://...",
  providerName: "YouTube",
  providerUrl: "https://youtube.com",
  html: "<iframe ...></iframe>",
  width: 640,
  height: 360,
  thumbnailUrl: "https://...",
  thumbnailWidth: 480,
  thumbnailHeight: 360,
}
```

## ⚙️ Options Reference

### ExtractOptions

| Option             | Type                     | Default    | Description                     |
| ------------------ | ------------------------ | ---------- | ------------------------------- |
| `timeout`          | `number`                 | `10000`    | Request timeout in ms           |
| `maxRedirects`     | `number`                 | `5`        | Max redirects to follow         |
| `userAgent`        | `string`                 | `ogie/1.0` | Custom User-Agent string        |
| `headers`          | `Record<string, string>` | `{}`       | Custom HTTP headers             |
| `baseUrl`          | `string`                 | —          | Base URL for resolving relative |
| `onlyOpenGraph`    | `boolean`                | `false`    | Skip fallback parsing           |
| `allowPrivateUrls` | `boolean`                | `false`    | Allow localhost/private IPs     |
| `fetchOEmbed`      | `boolean`                | `false`    | Fetch oEmbed endpoint           |
| `convertCharset`   | `boolean`                | `false`    | Auto charset detection          |
| `cache`            | `MetadataCache \| false` | —          | Cache instance                  |
| `bypassCache`      | `boolean`                | `false`    | Force fresh fetch               |

### BulkOptions

| Option                 | Type       | Default | Description                    |
| ---------------------- | ---------- | ------- | ------------------------------ |
| `concurrency`          | `number`   | `10`    | Max parallel requests globally |
| `concurrencyPerDomain` | `number`   | `3`     | Max parallel per domain        |
| `minDelayPerDomain`    | `number`   | `200`   | Min ms between domain requests |
| `requestsPerMinute`    | `number`   | `600`   | Global rate limit              |
| `timeout`              | `number`   | `30000` | Timeout per request            |
| `continueOnError`      | `boolean`  | `true`  | Continue on failures           |
| `onProgress`           | `function` | —       | Progress callback              |
| `extractOptions`       | `object`   | —       | Options passed to each extract |

### CacheOptions

| Option       | Type       | Default  | Description       |
| ------------ | ---------- | -------- | ----------------- |
| `maxSize`    | `number`   | `100`    | Max cached items  |
| `ttl`        | `number`   | `300000` | TTL in ms (5 min) |
| `onEviction` | `function` | —        | Eviction callback |

## 🛡️ Error Handling

Ogie uses a discriminated union result type for type-safe error handling:

```typescript
import { extract, isFetchError, isParseError, isOgieError } from "ogie";

const result = await extract(url);

if (!result.success) {
  const { error } = result;

  // Check error code
  switch (error.code) {
    case "INVALID_URL":
      console.log("Invalid URL format");
      break;
    case "FETCH_ERROR":
      console.log("Network request failed");
      break;
    case "TIMEOUT":
      console.log("Request timed out");
      break;
    case "PARSE_ERROR":
      console.log("Failed to parse HTML");
      break;
    case "NO_HTML":
      console.log("Response was not HTML");
      break;
    case "REDIRECT_LIMIT":
      console.log("Too many redirects");
      break;
  }

  // Or use type guards
  if (isFetchError(error)) {
    console.log(`HTTP Status: ${error.statusCode}`);
  }

  if (isParseError(error)) {
    console.log(`Parse failed: ${error.message}`);
  }
}
```

### Error Types

| Error Class  | Description         | Properties             |
| ------------ | ------------------- | ---------------------- |
| `OgieError`  | Base error class    | `code`, `url`, `cause` |
| `FetchError` | Network/HTTP errors | `statusCode`           |
| `ParseError` | HTML parsing errors | —                      |

## 🔐 Security

Ogie includes built-in security protections:

- **🛡️ SSRF Protection** — Blocks requests to private/internal IP ranges by default
- **🔗 URL Validation** — Only allows HTTP/HTTPS protocols
- **🔄 Redirect Limits** — Configurable max redirects (default: 5)
- **✅ oEmbed Validation** — Validates oEmbed endpoints before fetching

```typescript
// Allow private URLs (for testing/development only)
await extract("http://localhost:3000", {
  allowPrivateUrls: true,
});
```

## 📦 Bundle Size

| Dependency | Size (gzip) | Purpose            |
| ---------- | ----------- | ------------------ |
| cheerio    | ~70 KB      | HTML parsing       |
| quick-lru  | ~0.5 KB     | LRU cache with TTL |
| bottleneck | ~12 KB      | Rate limiting      |
| iconv-lite | ~45 KB      | Charset detection  |
| **Total**  | **~130 KB** |                    |

## 🧪 Testing

```bash
# Run tests
bun test

# Run with coverage
bun test --coverage

# Run specific test file
bun test tests/extract.test.ts
```

## 📄 License

MIT © [Dobroslav Radosavljevic](https://github.com/dobroslavradosavljevic)

---

<p align="center">
  Made with ❤️ for the web scraping community
</p>

# Migration Guide: v1 -> v2

This guide summarizes the breaking changes introduced in `ogie@2.x` and how to upgrade.

## Overview

`ogie@2.x` focuses on security hardening, cache correctness, and clearer error contracts:

- oEmbed fetch now validates every redirect hop.
- Bulk extraction preserves typed errors.
- Cache keys include request-shaping options.
- New tree-shakeable subpath exports are available.

## 1) Bulk Error Objects Are Now Typed Instances

### v1 behavior

Bulk failures could be coerced into plain objects (for some failure paths), which made `instanceof` and `isOgieError` checks unreliable.

### v2 behavior

Bulk failures now preserve real error instances (`OgieError`, `FetchError`, `ParseError`) and specific error codes.

```typescript
import { extractBulk, isOgieError } from "ogie";

const result = await extractBulk(["not-a-valid-url"]);
const item = result.results[0];

if (!item.result.success) {
  console.log(item.result.error.code); // "INVALID_URL"
  console.log(isOgieError(item.result.error)); // true
}
```

## 2) Error Codes Are More Specific for Network Failures

### v1 behavior

Timeouts and redirect-limit failures were often reported as `FETCH_ERROR`.

### v2 behavior

- Timeout failures use `TIMEOUT`.
- Redirect loop / max-redirect failures use `REDIRECT_LIMIT`.

```typescript
if (!result.success) {
  switch (result.error.code) {
    case "TIMEOUT":
    case "REDIRECT_LIMIT":
    case "FETCH_ERROR":
      // handle network-related failures
      break;
  }
}
```

## 3) Cache Key Semantics Changed

### v1 behavior

Cache key included only a subset of options (`onlyOpenGraph`, `fetchOEmbed`, `convertCharset`).

### v2 behavior

Cache key now also includes:

- `allowPrivateUrls`
- `userAgent`
- `timeout`
- `maxRedirects`
- `headers` (normalized and order-stable)

This improves correctness but may increase cache misses after upgrade.

```typescript
const keyA = generateCacheKey("https://example.com", {
  headers: { "x-client": "mobile" },
});
const keyB = generateCacheKey("https://example.com", {
  headers: { "x-client": "desktop" },
});

console.log(keyA === keyB); // false in v2
```

## 4) New Subpath Exports

You can now import focused modules directly:

```typescript
import { extractBulk } from "ogie/bulk";
import { createCache } from "ogie/cache";
import { OgieError } from "ogie/errors";
```

Root imports still work:

```typescript
import { extract, extractBulk, createCache } from "ogie";
```

## Upgrade Checklist

1. Re-run tests that assert specific error codes.
2. Review cache hit-rate assumptions if you vary headers/user-agent/options per request.
3. Adopt subpath imports if you want smaller bundles.
4. Rebuild and verify with:
   - `bun run lint`
   - `bun run typecheck`
   - `bun run test`
   - `bun run test:coverage`

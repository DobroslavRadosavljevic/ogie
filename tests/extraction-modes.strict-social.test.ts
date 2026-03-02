import { describe, expect, it } from "bun:test";

import { extractFromHtml, type ExtractSuccess } from "../src";
import { opengraphFixtures } from "./data";

describe("extraction modes - strict social filtering", () => {
  it("filters invalid Twitter URL and handle fields in platform-valid mode", () => {
    const html = `<!doctype html><html><head>
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Strict Twitter" />
      <meta name="twitter:image" content="ftp://example.com/twitter.jpg" />
      <meta name="twitter:site" content="example" />
      <meta name="twitter:creator" content="@valid_handle" />
    </head><body></body></html>`;

    const bestEffort = extractFromHtml(html, {
      baseUrl: "https://example.com",
      mode: "best-effort",
    }) as ExtractSuccess;

    const platformValid = extractFromHtml(html, {
      baseUrl: "https://example.com",
      mode: "platform-valid",
    }) as ExtractSuccess;

    expect(bestEffort.data.twitter.image?.url).toBe(
      "ftp://example.com/twitter.jpg"
    );
    expect(bestEffort.data.twitter.site).toBe("example");

    expect(platformValid.data.twitter.image).toBeUndefined();
    expect(platformValid.data.twitter.site).toBeUndefined();
    expect(platformValid.data.twitter.creator).toBe("@valid_handle");
  });

  it("keeps non-social metadata while filtering social metadata", () => {
    const html = `<!doctype html><html><head>
      <title>Strict Test</title>
      <meta name="description" content="Basic description" />
      <meta property="og:url" content="javascript:alert(1)" />
      <meta property="og:image" content="ftp://example.com/photo.jpg" />
    </head><body></body></html>`;

    const result = extractFromHtml(html, {
      baseUrl: "https://example.com",
      mode: "platform-valid",
    }) as ExtractSuccess;

    expect(result.success).toBe(true);
    expect(result.data.basic.title).toBe("Strict Test");
    expect(result.data.basic.description).toBe("Basic description");
    expect(result.data.og.url).toBeUndefined();
    expect(result.data.og.images).toHaveLength(0);
  });

  it("still succeeds when required OG fields are missing", () => {
    const result = extractFromHtml(opengraphFixtures.ogMissingRequired, {
      baseUrl: "https://example.com",
      mode: "platform-valid",
    }) as ExtractSuccess;

    expect(result.success).toBe(true);
    expect(result.data.og.type).toBe("article");
    expect(result.data.og.title).toBeUndefined();
  });
});

import { describe, expect, it } from "bun:test";

import { extractFromHtml, type ExtractSuccess } from "../src";
import { urlHandlingFixtures } from "./data/url-handling";

describe("URL Handling - Relative Paths", () => {
  const result = extractFromHtml(urlHandlingFixtures.urlRelativePaths, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("resolves og:url from relative path", () => {
    expect(result.data.og.url).toBe("https://example.com/about");
  });

  it("resolves dot-relative og:image", () => {
    expect(result.data.og.images[0].url).toBe(
      "https://example.com/images/hero.jpg"
    );
  });

  it("resolves parent-relative og:image", () => {
    expect(result.data.og.images[1].url).toBe(
      "https://example.com/shared/banner.png"
    );
  });

  it("extracts og:title", () => {
    expect(result.data.og.title).toBe("Relative Paths Test");
  });

  it("resolves twitter:image from relative path", () => {
    expect(result.data.twitter.image?.url).toBe(
      "https://example.com/twitter-image.jpg"
    );
  });

  it("resolves favicon from relative path", () => {
    expect(result.data.basic.favicon).toBe("https://example.com/favicon.ico");
  });

  it("resolves canonical from relative path", () => {
    expect(result.data.basic.canonical).toBe("https://example.com/about");
  });
});

describe("URL Handling - Protocol Relative URLs", () => {
  const result = extractFromHtml(urlHandlingFixtures.urlProtocolRelative, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("resolves protocol-relative og:image with https", () => {
    expect(result.data.og.images[0].url).toBe(
      "https://cdn.example.com/image.jpg"
    );
  });

  it("resolves protocol-relative og:url with https", () => {
    expect(result.data.og.url).toBe("https://www.example.com/page");
  });

  it("resolves protocol-relative og:video with https", () => {
    expect(result.data.og.videos).toHaveLength(1);
    expect(result.data.og.videos?.[0]?.url).toBe(
      "https://media.example.com/video.mp4"
    );
  });

  it("extracts og:title", () => {
    expect(result.data.og.title).toBe("Protocol Relative Test");
  });

  it("resolves protocol-relative canonical with https", () => {
    expect(result.data.basic.canonical).toBe("https://www.example.com/page");
  });
});

describe("URL Handling - Absolute Mixed URLs", () => {
  const result = extractFromHtml(urlHandlingFixtures.urlAbsoluteMixed, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("preserves absolute https og:url as-is", () => {
    expect(result.data.og.url).toBe("https://example.com/page");
  });

  it("preserves absolute http og:image as-is", () => {
    expect(result.data.og.images[0].url).toBe(
      "http://cdn.example.com/image.jpg"
    );
  });

  it("resolves relative og:image to absolute", () => {
    expect(result.data.og.images[1].url).toBe(
      "https://example.com/local-image.jpg"
    );
  });

  it("resolves protocol-relative og:image with https", () => {
    expect(result.data.og.images[2].url).toBe(
      "https://cdn2.example.com/image2.jpg"
    );
  });

  it("extracts og:title", () => {
    expect(result.data.og.title).toBe("Mixed URLs Test");
  });

  it("extracts all 3 images", () => {
    expect(result.data.og.images).toHaveLength(3);
  });
});

describe("URL Handling - No Base URL", () => {
  const result = extractFromHtml(
    urlHandlingFixtures.urlNoBaseUrl
  ) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("keeps relative og:url unresolved without valid base URL", () => {
    expect(result.data.og.url).toBe("/relative-page");
  });

  it("keeps relative og:image unresolved without valid base URL", () => {
    expect(result.data.og.images[0].url).toBe("/images/photo.jpg");
  });

  it("extracts og:title", () => {
    expect(result.data.og.title).toBe("No Base URL Test");
  });

  it("keeps relative canonical unresolved without valid base URL", () => {
    expect(result.data.basic.canonical).toBe("/canonical");
  });

  it("keeps relative favicon unresolved without valid base URL", () => {
    expect(result.data.basic.favicon).toBe("/favicon.ico");
  });
});

describe("URL Handling - Fragment Only URLs", () => {
  const result = extractFromHtml(urlHandlingFixtures.urlFragmentOnly, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("resolves fragment-only og:url against base URL", () => {
    expect(result.data.og.url).toContain("#section");
  });

  it("preserves absolute og:image as-is", () => {
    expect(result.data.og.images[0].url).toBe("https://example.com/image.jpg");
  });

  it("extracts og:title", () => {
    expect(result.data.og.title).toBe("Fragment URL Test");
  });

  it("resolves fragment-only canonical against base URL", () => {
    expect(result.data.basic.canonical).toContain("#top");
  });
});

describe("URL Handling - Query Strings", () => {
  const result = extractFromHtml(urlHandlingFixtures.urlQueryStrings, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("preserves query parameters in og:url", () => {
    expect(result.data.og.url).toContain("id=123");
    expect(result.data.og.url).toContain("lang=en");
    expect(result.data.og.url).toContain("ref=og");
  });

  it("preserves query parameters in og:image", () => {
    expect(result.data.og.images[0].url).toContain("w=1200");
    expect(result.data.og.images[0].url).toContain("h=630");
    expect(result.data.og.images[0].url).toContain("q=80");
    expect(result.data.og.images[0].url).toContain("format=webp");
  });

  it("extracts og:title", () => {
    expect(result.data.og.title).toBe("Query String Test");
  });

  it("preserves decoded &amp; entities in canonical query params", () => {
    expect(result.data.basic.canonical).toContain("id=123");
    expect(result.data.basic.canonical).toContain("lang=en");
  });
});

describe("URL Handling - International/IDN URLs", () => {
  const result = extractFromHtml(urlHandlingFixtures.urlInternationalIdn, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("preserves international characters in og:url", () => {
    expect(result.data.og.url).toBeDefined();
  });

  it("preserves international characters in og:image", () => {
    expect(result.data.og.images[0].url).toBeDefined();
  });

  it("extracts og:title", () => {
    expect(result.data.og.title).toBe("International URL Test");
  });

  it("preserves unicode in og:site_name", () => {
    expect(result.data.og.siteName).toBe("\u4F8B\u3048");
  });
});

describe("URL Handling - Double Encoded URLs", () => {
  const result = extractFromHtml(urlHandlingFixtures.urlDoubleEncoded, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("preserves double-encoded %2520 in og:url without double-decoding", () => {
    expect(result.data.og.url).toContain("%2520");
  });

  it("preserves double-encoded %252F in og:image without double-decoding", () => {
    expect(result.data.og.images[0].url).toContain("%252F");
  });

  it("extracts og:title", () => {
    expect(result.data.og.title).toBe("Double Encoded Test");
  });
});

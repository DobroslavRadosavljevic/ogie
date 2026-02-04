import { describe, expect, it } from "bun:test";

import { extractFromHtml, type ExtractSuccess } from "../src";
import { encodingFixtures } from "./data/encoding";

describe("extractFromHtml - UTF-8 BOM", () => {
  const result = extractFromHtml(encodingFixtures.utf8Bom, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("extracts og:title", () => {
    expect(result.data.og.title).toBe("UTF-8 BOM Test");
  });

  it("detects charset as utf-8", () => {
    expect(result.data.basic.charset).toBe("utf8");
  });
});

describe("extractFromHtml - Meta Charset Variations", () => {
  const result = extractFromHtml(encodingFixtures.metaCharsetVariations, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("detects charset as UTF-8", () => {
    expect(result.data.basic.charset).toBe("utf8");
  });
});

describe("extractFromHtml - HTTP Equiv Charset", () => {
  const result = extractFromHtml(encodingFixtures.httpEquiv, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("extracts og:title", () => {
    expect(result.data.og.title).toBe("HTTP Equiv Charset");
  });
});

describe("extractFromHtml - Mixed Charset Declarations", () => {
  const result = extractFromHtml(encodingFixtures.mixedDeclarations, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("meta charset takes priority (utf-8)", () => {
    expect(result.data.basic.charset).toBe("utf8");
  });
});

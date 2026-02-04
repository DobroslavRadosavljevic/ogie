import { describe, expect, it } from "bun:test";

import { extractFromHtml, type ExtractSuccess } from "../src";
import { fallbackFixtures } from "./data/fallbacks";

describe("extractFromHtml - OG Fallback from Twitter", () => {
  const result = extractFromHtml(fallbackFixtures.ogFromTwitter, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("falls back og:title to twitter:title", () => {
    expect(result.data.og.title).toBe("Twitter Fallback Title");
  });

  it("falls back og:description to twitter:description", () => {
    expect(result.data.og.description).toBe("Twitter Fallback Description");
  });
});

describe("extractFromHtml - OG Fallback from Basic", () => {
  const result = extractFromHtml(fallbackFixtures.ogFromBasic, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("falls back og:title to basic title", () => {
    expect(result.data.og.title).toBe("Basic Fallback Title");
  });

  it("falls back og:description to basic description", () => {
    expect(result.data.og.description).toBe("Basic Fallback Description");
  });
});

describe("extractFromHtml - Fallback Chain Priority", () => {
  const result = extractFromHtml(fallbackFixtures.chainPriority, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("og:title takes priority over twitter and basic", () => {
    expect(result.data.og.title).toBe("OG Title");
  });

  it("og:description takes priority over twitter and basic", () => {
    expect(result.data.og.description).toBe("OG Description");
  });
});

describe("extractFromHtml - Only OpenGraph Mode", () => {
  const resultWithFlag = extractFromHtml(fallbackFixtures.onlyOpengraphMode, {
    baseUrl: "https://example.com",
    onlyOpenGraph: true,
  }) as ExtractSuccess;

  const resultWithoutFlag = extractFromHtml(
    fallbackFixtures.onlyOpengraphMode,
    { baseUrl: "https://example.com" }
  ) as ExtractSuccess;

  it("succeeds with onlyOpenGraph flag", () => {
    expect(resultWithFlag.success).toBe(true);
  });

  it("og:title is undefined with onlyOpenGraph (no fallback)", () => {
    expect(resultWithFlag.data.og.title).toBeUndefined();
  });

  it("og:description is undefined with onlyOpenGraph (no fallback)", () => {
    expect(resultWithFlag.data.og.description).toBeUndefined();
  });

  it("succeeds without onlyOpenGraph flag", () => {
    expect(resultWithoutFlag.success).toBe(true);
  });

  it("falls back og:title to twitter:title without onlyOpenGraph", () => {
    expect(resultWithoutFlag.data.og.title).toBe("Twitter Only Title");
  });
});

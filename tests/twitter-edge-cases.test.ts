import { describe, expect, it } from "bun:test";

import { extractFromHtml, type ExtractSuccess } from "../src";
import { twitterFixtures } from "./data/twitter";

describe("extractFromHtml - Twitter Edge Cases", () => {
  describe("summaryMinimal", () => {
    const result = extractFromHtml(twitterFixtures.summaryMinimal, {
      baseUrl: "https://example.com",
    }) as ExtractSuccess;

    it("extracts card type as summary", () => {
      expect(result.data.twitter.card).toBe("summary");
    });

    it("extracts title", () => {
      expect(result.data.twitter.title).toBe("Minimal Summary");
    });

    it("has undefined description", () => {
      expect(result.data.twitter.description).toBeUndefined();
    });
  });

  describe("propertyAttr", () => {
    const result = extractFromHtml(twitterFixtures.propertyAttr, {
      baseUrl: "https://example.com",
    }) as ExtractSuccess;

    it("extracts card type via property attribute", () => {
      expect(result.data.twitter.card).toBe("summary_large_image");
    });

    it("extracts title via property attribute", () => {
      expect(result.data.twitter.title).toBe("Property Attr Title");
    });

    it("extracts description via property attribute", () => {
      expect(result.data.twitter.description).toBe("Using property attribute");
    });

    it("extracts image via property attribute", () => {
      expect(result.data.twitter.image?.url).toBe(
        "https://example.com/image.jpg"
      );
    });
  });

  describe("invalidCardType", () => {
    const result = extractFromHtml(twitterFixtures.invalidCardType, {
      baseUrl: "https://example.com",
    }) as ExtractSuccess;

    it("filters out invalid card type", () => {
      expect(result.data.twitter.card).toBeUndefined();
    });

    it("still extracts title", () => {
      expect(result.data.twitter.title).toBe("Invalid Card Type");
    });
  });

  describe("imageWithAlt", () => {
    const result = extractFromHtml(twitterFixtures.imageWithAlt, {
      baseUrl: "https://example.com",
    }) as ExtractSuccess;

    it("extracts image url", () => {
      expect(result.data.twitter.image?.url).toBe(
        "https://example.com/photo.jpg"
      );
    });

    it("extracts image alt text", () => {
      expect(result.data.twitter.image?.alt).toBe(
        "A photo of a sunset over the ocean"
      );
    });
  });

  describe("missingRequired", () => {
    const result = extractFromHtml(twitterFixtures.missingRequired, {
      baseUrl: "https://example.com",
    }) as ExtractSuccess;

    it("extracts card type as player", () => {
      expect(result.data.twitter.card).toBe("player");
    });

    it("extracts player url", () => {
      expect(result.data.twitter.player?.url).toBe(
        "https://example.com/player.html"
      );
    });

    it("has undefined player width", () => {
      expect(result.data.twitter.player?.width).toBeUndefined();
    });

    it("has undefined player height", () => {
      expect(result.data.twitter.player?.height).toBeUndefined();
    });
  });

  describe("emptyValues", () => {
    const result = extractFromHtml(twitterFixtures.emptyValues, {
      baseUrl: "https://example.com",
    }) as ExtractSuccess;

    it("treats empty card as undefined", () => {
      expect(result.data.twitter.card).toBeUndefined();
    });

    it("treats empty title as undefined", () => {
      expect(result.data.twitter.title).toBeUndefined();
    });

    it("treats empty description as undefined", () => {
      expect(result.data.twitter.description).toBeUndefined();
    });
  });

  describe("mixedAttrs", () => {
    const result = extractFromHtml(twitterFixtures.mixedAttrs, {
      baseUrl: "https://example.com",
    }) as ExtractSuccess;

    it("extracts card from name attribute", () => {
      expect(result.data.twitter.card).toBe("summary");
    });

    it("extracts title from property attribute", () => {
      expect(result.data.twitter.title).toBe("Mixed Attrs Title");
    });

    it("extracts description from name attribute", () => {
      expect(result.data.twitter.description).toBe("Mixed description");
    });

    it("extracts image from property attribute", () => {
      expect(result.data.twitter.image?.url).toBe(
        "https://example.com/mixed.jpg"
      );
    });

    it("extracts site from name attribute", () => {
      expect(result.data.twitter.site).toBe("@mixedsite");
    });
  });
});

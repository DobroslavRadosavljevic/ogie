import { describe, expect, it } from "bun:test";

import { extractFromHtml, type ExtractSuccess } from "../src";
import { faviconFixtures } from "./data/favicon";

describe("extractFromHtml - Favicon Edge Cases", () => {
  describe("dataUriSvg", () => {
    const result = extractFromHtml(faviconFixtures.dataUriSvg, {
      baseUrl: "https://example.com",
    }) as ExtractSuccess;

    it("extracts data URI favicon", () => {
      expect(result.data.basic.favicon).toBeDefined();
      expect(result.data.basic.favicon?.startsWith("data:image/svg+xml")).toBe(
        true
      );
    });

    it("has one favicon entry", () => {
      expect(result.data.basic.favicons?.length).toBe(1);
    });

    it("favicon entry has rel icon", () => {
      expect(result.data.basic.favicons?.[0]?.rel).toBe("icon");
    });
  });

  describe("multipleSizes", () => {
    const result = extractFromHtml(faviconFixtures.multipleSizes, {
      baseUrl: "https://example.com",
    }) as ExtractSuccess;

    it("extracts all four favicons", () => {
      expect(result.data.basic.favicons?.length).toBe(4);
    });

    it("first favicon is used as primary", () => {
      expect(result.data.basic.favicon).toBe("https://example.com/icon-48.png");
    });

    it("extracts correct sizes for each entry", () => {
      expect(result.data.basic.favicons).toBeDefined();
      const { favicons } = result.data.basic;
      expect(favicons?.[0]?.sizes).toBe("48x48");
      expect(favicons?.[1]?.sizes).toBe("96x96");
      expect(favicons?.[2]?.sizes).toBe("192x192");
      expect(favicons?.[3]?.sizes).toBe("any");
    });
  });

  describe("noType", () => {
    const result = extractFromHtml(faviconFixtures.noType, {
      baseUrl: "https://example.com",
    }) as ExtractSuccess;

    it("extracts favicons without type attribute", () => {
      expect(result.data.basic.favicons?.length).toBe(3);
    });

    it("favicon entries have undefined type", () => {
      expect(result.data.basic.favicons).toBeDefined();
      const { favicons } = result.data.basic;
      expect(favicons).toBeDefined();
      // eslint-disable-next-line jest/no-conditional-in-test
      for (const fav of favicons ?? []) {
        expect(fav.type).toBeUndefined();
      }
    });

    it("resolves relative URLs with baseUrl", () => {
      expect(result.data.basic.favicon).toBe("https://example.com/favicon.ico");
      expect(result.data.basic.favicons?.[1]?.url).toBe(
        "https://example.com/favicon.png"
      );
      expect(result.data.basic.favicons?.[2]?.url).toBe(
        "https://example.com/apple-icon.png"
      );
    });
  });

  describe("unusualRels", () => {
    const result = extractFromHtml(faviconFixtures.unusualRels, {
      baseUrl: "https://example.com",
    }) as ExtractSuccess;

    it("extracts mask-icon with color", () => {
      const maskIcon = result.data.basic.favicons?.find(
        (f) => f.rel === "mask-icon"
      );
      expect(maskIcon).toBeDefined();
      expect(maskIcon?.url).toBe("https://example.com/mask-icon.svg");
      expect(maskIcon?.color).toBe("#ff5500");
    });

    it("extracts apple-touch-icon-precomposed", () => {
      const precomposed = result.data.basic.favicons?.find(
        (f) => f.rel === "apple-touch-icon-precomposed"
      );
      expect(precomposed).toBeDefined();
      expect(precomposed?.url).toBe(
        "https://example.com/apple-precomposed.png"
      );
      expect(precomposed?.sizes).toBe("152x152");
    });

    it("extracts standard icon", () => {
      const icon = result.data.basic.favicons?.find((f) => f.rel === "icon");
      expect(icon).toBeDefined();
      expect(icon?.url).toBe("https://example.com/favicon.ico");
      expect(icon?.type).toBe("image/x-icon");
    });

    it("does not extract fluid-icon (not a recognized rel)", () => {
      const fluidIcon = result.data.basic.favicons?.find(
        (f) => f.url === "https://example.com/fluidicon.png"
      );
      expect(fluidIcon).toBeUndefined();
    });
  });
});

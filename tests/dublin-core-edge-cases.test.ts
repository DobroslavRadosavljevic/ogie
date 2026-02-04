import { describe, expect, it } from "bun:test";

import { extractFromHtml, type ExtractSuccess } from "../src";
import { dublinCoreFixtures } from "./data/dublin-core";

describe("Dublin Core Edge Cases - Full DCTERMS", () => {
  const result = extractFromHtml(dublinCoreFixtures.dcFullDcterms, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("dublinCore is defined", () => {
    expect(result.data.dublinCore).toBeDefined();
  });

  describe("basic fields", () => {
    it("extracts title", () => {
      expect(result.data.dublinCore?.title).toBe("Full DCTERMS Document");
    });

    it("extracts creator", () => {
      expect(result.data.dublinCore?.creator).toBe("Author Name");
    });

    it("extracts subject", () => {
      expect(result.data.dublinCore?.subject).toBe("Testing");
    });

    it("extracts description", () => {
      expect(result.data.dublinCore?.description).toBe(
        "A test document with full DCTERMS"
      );
    });
  });

  describe("metadata fields", () => {
    it("extracts publisher", () => {
      expect(result.data.dublinCore?.publisher).toBe("Test Publisher");
    });

    it("extracts contributor", () => {
      expect(result.data.dublinCore?.contributor).toBe("Contributor Name");
    });

    it("maps DCTERMS.created to date field", () => {
      expect(result.data.dublinCore?.date).toBe("2024-01-01");
    });

    it("extracts type", () => {
      expect(result.data.dublinCore?.type).toBe("Text");
    });

    it("extracts format", () => {
      expect(result.data.dublinCore?.format).toBe("text/html");
    });

    it("extracts identifier", () => {
      expect(result.data.dublinCore?.identifier).toBe(
        "urn:isbn:978-3-16-148410-0"
      );
    });

    it("extracts language", () => {
      expect(result.data.dublinCore?.language).toBe("en");
    });

    it("extracts rights", () => {
      expect(result.data.dublinCore?.rights).toBe("CC BY 4.0");
    });
  });
});

describe("Dublin Core Edge Cases - Mixed case variants", () => {
  const result = extractFromHtml(dublinCoreFixtures.dcMixedCaseVariants, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("dublinCore is defined", () => {
    expect(result.data.dublinCore).toBeDefined();
  });

  it("extracts title from lowercase dc.title", () => {
    expect(result.data.dublinCore?.title).toBe("Lowercase DC");
  });

  it("extracts creator from uppercase DC.CREATOR", () => {
    expect(result.data.dublinCore?.creator).toBe("Uppercase Creator");
  });

  it("extracts subject from mixed case Dc.Subject", () => {
    expect(result.data.dublinCore?.subject).toBe("Mixed Case Subject");
  });

  it("maps lowercase dcterms.created to date", () => {
    expect(result.data.dublinCore?.date).toBe("2024-01-01");
  });
});

describe("Dublin Core Edge Cases - Link relation", () => {
  const result = extractFromHtml(dublinCoreFixtures.dcLinkRelation, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("extracts title from meta tag", () => {
    expect(result.data.dublinCore?.title).toBe("Link DC Document");
  });

  it("extracts relation data from link tags", () => {
    expect(result.data.dublinCore?.relation).toBeDefined();
  });

  it("extracts multiple relation values as array", () => {
    expect(result.data.dublinCore?.relation).toEqual([
      "https://example.com/related-1",
      "https://example.com/related-2",
      "https://example.com/collection",
    ]);
  });
});

describe("Dublin Core Edge Cases - Multiple values", () => {
  const result = extractFromHtml(dublinCoreFixtures.dcMultipleValues, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("extracts title", () => {
    expect(result.data.dublinCore?.title).toBe("Multi-Value DC");
  });

  it("extracts 5 creator values as array", () => {
    expect(result.data.dublinCore?.creator).toEqual([
      "Author One",
      "Author Two",
      "Author Three",
      "Author Four",
      "Author Five",
    ]);
  });

  it("extracts 5 subject values as array", () => {
    expect(result.data.dublinCore?.subject).toEqual([
      "Subject A",
      "Subject B",
      "Subject C",
      "Subject D",
      "Subject E",
    ]);
  });
});

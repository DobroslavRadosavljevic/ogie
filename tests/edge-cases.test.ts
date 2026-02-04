import { describe, expect, it } from "bun:test";

import { extractFromHtml, type ExtractSuccess } from "../src";
import { edgeCaseFixtures } from "./data/edge-cases";

describe("extractFromHtml - Malformed Unclosed Tags", () => {
  const result = extractFromHtml(edgeCaseFixtures.malformedUnclosedTags, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds despite malformed HTML", () => {
    expect(result.success).toBe(true);
  });

  it("extracts og:title", () => {
    expect(result.data.og.title).toBe("Unclosed Tags Test");
  });

  it("returns undefined for og:description (unclosed tag absorbs next meta)", () => {
    expect(result.data.og.description).toBeUndefined();
  });
});

describe("extractFromHtml - Missing Doctype", () => {
  const result = extractFromHtml(edgeCaseFixtures.malformedMissingDoctype, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds without doctype", () => {
    expect(result.success).toBe(true);
  });

  it("extracts og:title", () => {
    expect(result.data.og.title).toBe("No Doctype Page");
  });

  it("extracts og:type", () => {
    expect(result.data.og.type).toBe("website");
  });
});

describe("extractFromHtml - Broken Nesting", () => {
  const result = extractFromHtml(edgeCaseFixtures.malformedBrokenNesting, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds despite broken nesting", () => {
    expect(result.success).toBe(true);
  });

  it("extracts og:title from head", () => {
    expect(result.data.og.title).toBe("Broken Nesting");
  });

  it("extracts og:description from body (Cheerio parses full document)", () => {
    expect(result.data.og.description).toBe("Body Description");
  });

  it("extracts og:url from body", () => {
    expect(result.data.og.url).toBe("https://example.com/broken");
  });
});

describe("extractFromHtml - Only Body (No Head)", () => {
  const result = extractFromHtml(edgeCaseFixtures.malformedOnlyBody, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds without head section", () => {
    expect(result.success).toBe(true);
  });

  it("extracts og:title from body", () => {
    expect(result.data.og.title).toBe("Body Only");
  });

  it("extracts og:type from body", () => {
    expect(result.data.og.type).toBe("website");
  });

  it("extracts basic description from body", () => {
    expect(result.data.basic.description).toBe("A page with no head section");
  });
});

describe("extractFromHtml - Empty Head", () => {
  const result = extractFromHtml(edgeCaseFixtures.malformedNoHead, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds with empty head", () => {
    expect(result.success).toBe(true);
  });

  it("extracts og:title from body", () => {
    expect(result.data.og.title).toBe("No Head Content");
  });

  it("extracts og:image from body", () => {
    expect(result.data.og.images).toHaveLength(1);
    expect(result.data.og.images[0].url).toBe("https://example.com/image.png");
  });
});

describe("extractFromHtml - Comments In Meta", () => {
  const result = extractFromHtml(edgeCaseFixtures.malformedCommentsInMeta, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("extracts visible og:title", () => {
    expect(result.data.og.title).toBe("Comments Test");
  });

  it("does not extract commented-out title", () => {
    expect(result.data.og.title).not.toBe("Hidden Title");
  });

  it("extracts og:description", () => {
    expect(result.data.og.description).toBe("Visible Description");
  });

  it("does not extract commented-out site_name", () => {
    expect(result.data.og.siteName).toBeUndefined();
  });
});

describe("extractFromHtml - Self-Closing Variants", () => {
  const result = extractFromHtml(
    edgeCaseFixtures.malformedSelfClosingVariants,
    { baseUrl: "https://example.com" }
  ) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("extracts og:title (self-closing with slash)", () => {
    expect(result.data.og.title).toBe("Self Close Test");
  });

  it("extracts og:type (no self-close)", () => {
    expect(result.data.og.type).toBe("website");
  });

  it("extracts og:url (uppercase tag)", () => {
    expect(result.data.og.url).toBe("https://example.com/self-close");
  });

  it("extracts og:description (space before closing bracket)", () => {
    expect(result.data.og.description).toBe("Mixed closing styles");
  });
});

describe("extractFromHtml - Empty Document", () => {
  const result = extractFromHtml(edgeCaseFixtures.emptyDocument, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds with empty document", () => {
    expect(result.success).toBe(true);
  });

  it("returns undefined og:title", () => {
    expect(result.data.og.title).toBeUndefined();
  });

  it("returns undefined og:description", () => {
    expect(result.data.og.description).toBeUndefined();
  });

  it("returns empty images array", () => {
    expect(result.data.og.images).toHaveLength(0);
  });
});

describe("extractFromHtml - Whitespace-Only Values", () => {
  const result = extractFromHtml(edgeCaseFixtures.whitespaceOnlyValues, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("returns undefined for whitespace-only og:title", () => {
    expect(result.data.og.title).toBeUndefined();
  });

  it("returns undefined for whitespace-only og:description", () => {
    expect(result.data.og.description).toBeUndefined();
  });

  it("returns undefined for empty og:url", () => {
    expect(result.data.og.url).toBeUndefined();
  });

  it("extracts valid og:type", () => {
    expect(result.data.og.type).toBe("website");
  });
});

describe("extractFromHtml - Extremely Long Values", () => {
  const result = extractFromHtml(edgeCaseFixtures.extremelyLongValues, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("preserves long og:title without truncation", () => {
    expect(result.data.og.title).toBeDefined();
    expect(result.data.og.title?.length).toBeGreaterThan(10_000);
  });

  it("preserves long og:description without truncation", () => {
    expect(result.data.og.description).toBeDefined();
    expect(result.data.og.description?.length).toBeGreaterThan(5000);
  });

  it("extracts og:type", () => {
    expect(result.data.og.type).toBe("article");
  });
});

describe("extractFromHtml - Special Characters & Unicode", () => {
  const result = extractFromHtml(edgeCaseFixtures.specialCharactersUnicode, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("extracts og:title with CJK characters", () => {
    expect(result.data.og.title).toContain("\u4F60\u597D\u4E16\u754C");
    expect(result.data.og.title).toContain(
      "\u3053\u3093\u306B\u3061\u306F\u4E16\u754C"
    );
  });

  it("extracts og:description with emoji", () => {
    expect(result.data.og.description).toContain("\uD83C\uDF0D");
    expect(result.data.og.description).toContain("\uD83C\uDF89");
    expect(result.data.og.description).toContain("\u2728");
  });

  it("extracts author with Arabic characters", () => {
    expect(result.data.basic.author).toContain("\u0645\u062D\u0645\u062F");
  });

  it("extracts og:site_name with accented characters", () => {
    expect(result.data.og.siteName).toBe("Caf\u00E9 R\u00E9sum\u00E9");
  });
});

describe("extractFromHtml - HTML Entities In Meta", () => {
  const result = extractFromHtml(edgeCaseFixtures.htmlEntitiesInMeta, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("decodes &amp; entity in og:title", () => {
    expect(result.data.og.title).toBe("Tom & Jerry");
  });

  it("decodes &lt; and &gt; entities in og:description", () => {
    expect(result.data.og.description).toBe("Price: <$10 > $5");
  });

  it("decodes &quot; and numeric entities in keywords", () => {
    expect(result.data.basic.keywords).toContain('"quoted"');
    expect(result.data.basic.keywords).toContain("\u2014");
  });
});

describe("extractFromHtml - CDATA Sections", () => {
  const result = extractFromHtml(edgeCaseFixtures.cdataSections, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("extracts og:title", () => {
    expect(result.data.og.title).toBe("CDATA Page");
  });

  it("extracts og:type", () => {
    expect(result.data.og.type).toBe("website");
  });
});

describe("extractFromHtml - SVG Embedded", () => {
  const result = extractFromHtml(edgeCaseFixtures.svgEmbedded, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("extracts og:title from head, not SVG title", () => {
    expect(result.data.og.title).toBe("SVG Page");
  });

  it("extracts og:description from head", () => {
    expect(result.data.og.description).toBe("Page with embedded SVG");
  });

  it("does not confuse SVG title with basic title", () => {
    expect(result.data.og.title).not.toBe("SVG Title");
  });
});

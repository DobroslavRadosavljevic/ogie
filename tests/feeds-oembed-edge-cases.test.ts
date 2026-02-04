import { describe, expect, it } from "bun:test";

import { extractFromHtml, type ExtractSuccess } from "../src";
import { feedsOembedFixtures } from "./data/feeds-oembed";

describe("Feeds & oEmbed Edge Cases - RSS/Atom/JSON feeds", () => {
  const result = extractFromHtml(feedsOembedFixtures.feedsRssAtomJson, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("extracts 3 feeds", () => {
    expect(result.data.feeds?.feeds).toHaveLength(3);
  });

  it("extracts RSS feed type", () => {
    expect(result.data.feeds?.feeds[0].type).toBe("rss");
  });

  it("extracts Atom feed type", () => {
    expect(result.data.feeds?.feeds[1].type).toBe("atom");
  });

  it("extracts JSON feed type", () => {
    expect(result.data.feeds?.feeds[2].type).toBe("json");
  });

  it("extracts og:title alongside feeds", () => {
    expect(result.data.og.title).toBe("All Feeds Page");
  });
});

describe("Feeds & oEmbed Edge Cases - WordPress pattern", () => {
  const result = extractFromHtml(feedsOembedFixtures.feedsWordpressPattern, {
    baseUrl: "https://myblog.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("extracts 3 WordPress feeds", () => {
    expect(result.data.feeds?.feeds).toHaveLength(3);
  });

  it("all feeds are RSS type", () => {
    expect(result.data.feeds?.feeds).toBeDefined();
    const feeds = result.data.feeds?.feeds;
    expect(feeds?.length).toBeGreaterThan(0);
    expect(feeds).toBeDefined();
    // eslint-disable-next-line jest/no-conditional-in-test
    for (const feed of feeds ?? []) {
      expect(feed.type).toBe("rss");
    }
  });

  it("extracts generator meta tag", () => {
    expect(result.data.basic.generator).toBe("WordPress 6.4");
  });
});

describe("Feeds & oEmbed Edge Cases - Multiple formats", () => {
  const result = extractFromHtml(feedsOembedFixtures.feedsMultipleFormats, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("extracts 3 feeds in different formats", () => {
    expect(result.data.feeds?.feeds).toHaveLength(3);
  });

  it("preserves feed order (rss, atom, json)", () => {
    expect(result.data.feeds?.feeds[0].type).toBe("rss");
    expect(result.data.feeds?.feeds[1].type).toBe("atom");
    expect(result.data.feeds?.feeds[2].type).toBe("json");
  });
});

describe("Feeds & oEmbed Edge Cases - Missing attributes", () => {
  const result = extractFromHtml(feedsOembedFixtures.feedsMissingAttributes, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("extracts only the valid feed (skips no-href, no-type, empty-href, wrong-type)", () => {
    expect(result.data.feeds?.feeds).toHaveLength(1);
  });

  it("valid feed has correct URL", () => {
    expect(result.data.feeds?.feeds[0].url).toBe(
      "https://example.com/valid-feed.xml"
    );
  });

  it("valid feed has correct title", () => {
    expect(result.data.feeds?.feeds[0].title).toBe("Valid Feed");
  });
});

describe("Feeds & oEmbed Edge Cases - oEmbed JSON only", () => {
  const result = extractFromHtml(feedsOembedFixtures.oembedJsonOnly, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("discovers JSON oEmbed URL", () => {
    expect(result.data.oEmbedDiscovery?.jsonUrl).toBe(
      "https://example.com/oembed?format=json"
    );
  });

  it("does not discover XML oEmbed URL", () => {
    expect(result.data.oEmbedDiscovery?.xmlUrl).toBeUndefined();
  });
});

describe("Feeds & oEmbed Edge Cases - oEmbed XML only", () => {
  const result = extractFromHtml(feedsOembedFixtures.oembedXmlOnly, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("discovers XML oEmbed URL", () => {
    expect(result.data.oEmbedDiscovery?.xmlUrl).toBe(
      "https://example.com/oembed?format=xml"
    );
  });

  it("does not discover JSON oEmbed URL", () => {
    expect(result.data.oEmbedDiscovery?.jsonUrl).toBeUndefined();
  });
});

describe("Feeds & oEmbed Edge Cases - Multiple oEmbed links", () => {
  const result = extractFromHtml(feedsOembedFixtures.oembedMultipleLinks, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("takes first JSON oEmbed URL", () => {
    expect(result.data.oEmbedDiscovery?.jsonUrl).toBe(
      "https://example.com/oembed/1?format=json"
    );
  });

  it("takes first XML oEmbed URL", () => {
    expect(result.data.oEmbedDiscovery?.xmlUrl).toBe(
      "https://example.com/oembed/1?format=xml"
    );
  });
});

describe("Feeds & oEmbed Edge Cases - Relative oEmbed URLs", () => {
  const result = extractFromHtml(feedsOembedFixtures.oembedRelativeUrls, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("stores relative oEmbed JSON URL as-is (parser does not resolve)", () => {
    expect(result.data.oEmbedDiscovery?.jsonUrl).toBe(
      "/api/oembed?format=json"
    );
  });
});

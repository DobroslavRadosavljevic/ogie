import { describe, expect, it } from "bun:test";

import { extractFromHtml, type ExtractSuccess } from "../src";
import { opengraphFixtures } from "./data/opengraph";

describe("OpenGraph Edge Cases - Duplicate Titles", () => {
  const result = extractFromHtml(opengraphFixtures.ogDuplicateTitles, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("uses first og:title value (first-wins)", () => {
    expect(result.data.og.title).toBe("First Title");
  });

  it("extracts og:type", () => {
    expect(result.data.og.type).toBe("website");
  });
});

describe("OpenGraph Edge Cases - Case Sensitivity", () => {
  const result = extractFromHtml(opengraphFixtures.ogCaseSensitivity, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("matches OG:Title (case-insensitive)", () => {
    expect(result.data.og.title).toBe("Case Test Title");
  });

  it("matches og:DESCRIPTION (case-insensitive)", () => {
    expect(result.data.og.description).toBe("Case Test Description");
  });

  it("matches Og:Type (case-insensitive)", () => {
    expect(result.data.og.type).toBe("website");
  });

  it("has empty images array", () => {
    expect(result.data.og.images).toHaveLength(0);
  });
});

describe("OpenGraph Edge Cases - name= vs property= Attribute", () => {
  const result = extractFromHtml(opengraphFixtures.ogNameVsProperty, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("extracts og:title from name attribute", () => {
    expect(result.data.og.title).toBe("Name Attr Title");
  });

  it("extracts og:description from name attribute", () => {
    expect(result.data.og.description).toBe("Name Attr Description");
  });

  it("extracts og:type from property attribute", () => {
    expect(result.data.og.type).toBe("website");
  });
});

describe("OpenGraph Edge Cases - Multiple Images", () => {
  const result = extractFromHtml(opengraphFixtures.ogMultipleImages, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("extracts all 5 images", () => {
    expect(result.data.og.images).toHaveLength(5);
  });

  it("extracts first image with dimensions and alt", () => {
    expect(result.data.og.images[0].url).toBe("https://example.com/img1.jpg");
    expect(result.data.og.images[0].width).toBe(1200);
    expect(result.data.og.images[0].height).toBe(630);
    expect(result.data.og.images[0].alt).toBe("First image");
  });

  it("extracts second image with dimensions", () => {
    expect(result.data.og.images[1].url).toBe("https://example.com/img2.jpg");
    expect(result.data.og.images[1].width).toBe(800);
    expect(result.data.og.images[1].height).toBe(600);
  });

  it("extracts third image with dimensions and alt", () => {
    expect(result.data.og.images[2].url).toBe("https://example.com/img3.jpg");
    expect(result.data.og.images[2].width).toBe(640);
    expect(result.data.og.images[2].height).toBe(480);
    expect(result.data.og.images[2].alt).toBe("Third image");
  });

  it("extracts fourth image with dimensions", () => {
    expect(result.data.og.images[3].url).toBe("https://example.com/img4.jpg");
    expect(result.data.og.images[3].width).toBe(1920);
    expect(result.data.og.images[3].height).toBe(1080);
  });

  it("extracts fifth image without dimensions", () => {
    expect(result.data.og.images[4].url).toBe("https://example.com/img5.jpg");
    expect(result.data.og.images[4].width).toBeUndefined();
    expect(result.data.og.images[4].height).toBeUndefined();
  });
});

describe("OpenGraph Edge Cases - Image All Properties", () => {
  const result = extractFromHtml(opengraphFixtures.ogImageAllProperties, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("extracts single image", () => {
    expect(result.data.og.images).toHaveLength(1);
  });

  it("extracts image url", () => {
    expect(result.data.og.images[0].url).toBe("https://example.com/photo.jpg");
  });

  it("extracts image secure_url", () => {
    expect(result.data.og.images[0].secureUrl).toBe(
      "https://secure.example.com/photo.jpg"
    );
  });

  it("extracts image type", () => {
    expect(result.data.og.images[0].type).toBe("image/jpeg");
  });

  it("extracts image width", () => {
    expect(result.data.og.images[0].width).toBe(1920);
  });

  it("extracts image height", () => {
    expect(result.data.og.images[0].height).toBe(1080);
  });

  it("extracts image alt", () => {
    expect(result.data.og.images[0].alt).toBe("A beautiful landscape photo");
  });
});

describe("OpenGraph Edge Cases - Video Complete", () => {
  const result = extractFromHtml(opengraphFixtures.ogVideoComplete, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("extracts video with all properties", () => {
    expect(result.data.og.videos).toHaveLength(1);
    expect(result.data.og.videos?.[0]?.url).toBe(
      "https://example.com/video.mp4"
    );
    expect(result.data.og.videos?.[0]?.secureUrl).toBe(
      "https://secure.example.com/video.mp4"
    );
    expect(result.data.og.videos?.[0]?.type).toBe("video/mp4");
    expect(result.data.og.videos?.[0]?.width).toBe(1280);
    expect(result.data.og.videos?.[0]?.height).toBe(720);
  });

  it("extracts audio with all properties", () => {
    expect(result.data.og.audio).toHaveLength(1);
    expect(result.data.og.audio?.[0]?.url).toBe(
      "https://example.com/audio.mp3"
    );
    expect(result.data.og.audio?.[0]?.secureUrl).toBe(
      "https://secure.example.com/audio.mp3"
    );
    expect(result.data.og.audio?.[0]?.type).toBe("audio/mpeg");
  });
});

describe("OpenGraph Edge Cases - Audio Complete", () => {
  const result = extractFromHtml(opengraphFixtures.ogAudioComplete, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("extracts two audio tracks", () => {
    expect(result.data.og.audio).toHaveLength(2);
  });

  it("extracts first audio track", () => {
    expect(result.data.og.audio?.[0]?.url).toBe(
      "https://example.com/track1.mp3"
    );
    expect(result.data.og.audio?.[0]?.type).toBe("audio/mpeg");
  });

  it("extracts second audio track", () => {
    expect(result.data.og.audio?.[1]?.url).toBe(
      "https://example.com/track2.ogg"
    );
    expect(result.data.og.audio?.[1]?.type).toBe("audio/ogg");
  });
});

describe("OpenGraph Edge Cases - Relative URLs", () => {
  const result = extractFromHtml(opengraphFixtures.ogRelativeUrls, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("resolves relative og:url", () => {
    expect(result.data.og.url).toBe("https://example.com/page/about");
  });

  it("resolves relative image URLs", () => {
    expect(result.data.og.images).toHaveLength(2);
    expect(result.data.og.images[0].url).toBe(
      "https://example.com/images/photo.jpg"
    );
    expect(result.data.og.images[1].url).toBe(
      "https://example.com/shared/banner.png"
    );
  });

  it("resolves relative video URL", () => {
    expect(result.data.og.videos).toHaveLength(1);
    expect(result.data.og.videos?.[0]?.url).toBe(
      "https://example.com/videos/intro.mp4"
    );
  });
});

describe("OpenGraph Edge Cases - Protocol Relative URLs", () => {
  const result = extractFromHtml(opengraphFixtures.ogProtocolRelative, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("resolves protocol-relative og:url with https", () => {
    expect(result.data.og.url).toBe("https://www.example.com/page");
  });

  it("resolves protocol-relative image URL with https", () => {
    expect(result.data.og.images).toHaveLength(1);
    expect(result.data.og.images[0].url).toBe(
      "https://cdn.example.com/image.jpg"
    );
  });

  it("resolves protocol-relative video URL with https", () => {
    expect(result.data.og.videos).toHaveLength(1);
    expect(result.data.og.videos?.[0]?.url).toBe(
      "https://media.example.com/video.mp4"
    );
  });
});

describe("OpenGraph Edge Cases - Invalid URLs", () => {
  const result = extractFromHtml(opengraphFixtures.ogInvalidUrls, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("extracts og:title", () => {
    expect(result.data.og.title).toBe("Invalid URLs Page");
  });

  it("stores og:url value as-is (library does not validate URL format)", () => {
    expect(result.data.og.url).toBeDefined();
  });

  it("stores ftp image URL as-is", () => {
    expect(result.data.og.images).toHaveLength(1);
    expect(result.data.og.images[0].url).toBe("ftp://example.com/image.jpg");
  });
});

describe("OpenGraph Edge Cases - Missing Required Fields", () => {
  const result = extractFromHtml(opengraphFixtures.ogMissingRequired, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("og:title is undefined when not present", () => {
    expect(result.data.og.title).toBeUndefined();
  });

  it("extracts og:type", () => {
    expect(result.data.og.type).toBe("article");
  });

  it("extracts og:site_name", () => {
    expect(result.data.og.siteName).toBe("Example Site");
  });

  it("extracts image even without og:title or og:url", () => {
    expect(result.data.og.images).toHaveLength(1);
    expect(result.data.og.images[0].url).toBe("https://example.com/img.jpg");
  });

  it("og:url is undefined when not present", () => {
    expect(result.data.og.url).toBeUndefined();
  });
});

describe("OpenGraph Edge Cases - Unknown Type", () => {
  const result = extractFromHtml(opengraphFixtures.ogUnknownType, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("preserves non-standard og:type as-is", () => {
    expect(result.data.og.type).toBe("product");
  });

  it("extracts og:title", () => {
    expect(result.data.og.title).toBe("Custom Product");
  });
});

describe("OpenGraph Edge Cases - Empty Values", () => {
  const result = extractFromHtml(opengraphFixtures.ogEmptyValues, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("treats empty og:title as undefined", () => {
    expect(result.data.og.title).toBeUndefined();
  });

  it("treats empty og:description as undefined", () => {
    expect(result.data.og.description).toBeUndefined();
  });

  it("treats empty og:type as undefined", () => {
    expect(result.data.og.type).toBeUndefined();
  });

  it("treats empty og:url as undefined", () => {
    expect(result.data.og.url).toBeUndefined();
  });

  it("does not create image entry from empty og:image", () => {
    expect(result.data.og.images).toHaveLength(0);
  });
});

describe("OpenGraph Edge Cases - Determiner Variants", () => {
  it("extracts valid determiner 'the'", () => {
    const result = extractFromHtml(opengraphFixtures.ogDeterminerVariants, {
      baseUrl: "https://example.com",
    }) as ExtractSuccess;

    expect(result.success).toBe(true);
    expect(result.data.og.determiner).toBe("the");
    expect(result.data.og.title).toBe("Determiner Test");
  });

  it("accepts determiner 'a'", () => {
    const html = `<!doctype html><html><head>
      <meta property="og:title" content="Test" />
      <meta property="og:determiner" content="a" />
    </head><body></body></html>`;
    const result = extractFromHtml(html) as ExtractSuccess;
    expect(result.data.og.determiner).toBe("a");
  });

  it("accepts determiner 'an'", () => {
    const html = `<!doctype html><html><head>
      <meta property="og:title" content="Test" />
      <meta property="og:determiner" content="an" />
    </head><body></body></html>`;
    const result = extractFromHtml(html) as ExtractSuccess;
    expect(result.data.og.determiner).toBe("an");
  });

  it("accepts determiner 'auto'", () => {
    const html = `<!doctype html><html><head>
      <meta property="og:title" content="Test" />
      <meta property="og:determiner" content="auto" />
    </head><body></body></html>`;
    const result = extractFromHtml(html) as ExtractSuccess;
    expect(result.data.og.determiner).toBe("auto");
  });

  it("rejects invalid determiner value", () => {
    const html = `<!doctype html><html><head>
      <meta property="og:title" content="Test" />
      <meta property="og:determiner" content="invalid" />
    </head><body></body></html>`;
    const result = extractFromHtml(html) as ExtractSuccess;
    expect(result.data.og.determiner).toBeUndefined();
  });
});

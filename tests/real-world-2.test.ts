import { describe, expect, it } from "bun:test";

import { extractFromHtml, type ExtractSuccess } from "../src";
import { realWorldFixtures } from "./data/real-world";

describe("Real-world: Stack Overflow question", () => {
  const result = extractFromHtml(realWorldFixtures.stackoverflowQuestion, {
    baseUrl: "https://stackoverflow.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("extracts og:type as website", () => {
    expect(result.data.og.type).toBe("website");
  });

  it("extracts og:title", () => {
    expect(result.data.og.title).toBe(
      "How to extract OpenGraph metadata in TypeScript?"
    );
  });

  it("extracts og:site_name", () => {
    expect(result.data.og.siteName).toBe("Stack Overflow");
  });

  it("extracts twitter:card as summary", () => {
    expect(result.data.twitter.card).toBe("summary");
  });

  it("extracts twitter:site", () => {
    expect(result.data.twitter.site).toBe("@stackoverflow");
  });

  it("extracts JSON-LD with QAPage type", () => {
    expect(result.data.jsonLd).toBeDefined();
    expect(result.data.jsonLd?.items).toHaveLength(1);
    expect(result.data.jsonLd?.items[0].type).toBe("QAPage");
  });

  it("extracts canonical URL", () => {
    expect(result.data.basic.canonical).toBe(
      "https://stackoverflow.com/questions/12345678"
    );
  });
});

describe("Real-world: Reddit post", () => {
  const result = extractFromHtml(realWorldFixtures.redditPost, {
    baseUrl: "https://www.reddit.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("extracts og:site_name as Reddit", () => {
    expect(result.data.og.siteName).toBe("Reddit");
  });

  it("extracts og:title", () => {
    expect(result.data.og.title).toBe("Check out this new metadata library!");
  });

  it("extracts twitter:card as summary_large_image", () => {
    expect(result.data.twitter.card).toBe("summary_large_image");
  });

  it("has iOS app links defined", () => {
    expect(result.data.appLinks).toBeDefined();
    expect(result.data.appLinks?.ios).toBeDefined();
    expect(result.data.appLinks?.ios?.[0]?.appStoreId).toBe("1064216828");
    expect(result.data.appLinks?.ios?.[0]?.appName).toBe("Reddit");
    expect(result.data.appLinks?.ios?.[0]?.url).toBe(
      "reddit://r/webdev/comments/abc123"
    );
  });

  it("has Android app links defined", () => {
    expect(result.data.appLinks?.android).toBeDefined();
    expect(result.data.appLinks?.android?.[0]?.package).toBe(
      "com.reddit.frontpage"
    );
    expect(result.data.appLinks?.android?.[0]?.appName).toBe("Reddit");
    expect(result.data.appLinks?.android?.[0]?.url).toBe(
      "reddit://r/webdev/comments/abc123"
    );
  });
});

describe("Real-world: LinkedIn profile", () => {
  const result = extractFromHtml(realWorldFixtures.linkedinProfile, {
    baseUrl: "https://www.linkedin.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("extracts og:type as profile", () => {
    expect(result.data.og.type).toBe("profile");
  });

  it("extracts og:title", () => {
    expect(result.data.og.title).toBe("Jane Developer - Software Engineer");
  });

  it("extracts og:site_name", () => {
    expect(result.data.og.siteName).toBe("LinkedIn");
  });

  it("extracts robots meta as noarchive", () => {
    expect(result.data.basic.robots).toBe("noarchive");
  });

  it("extracts canonical URL", () => {
    expect(result.data.basic.canonical).toBe(
      "https://www.linkedin.com/in/janedeveloper"
    );
  });
});

describe("Real-world: IMDB movie", () => {
  const result = extractFromHtml(realWorldFixtures.imdbMovie, {
    baseUrl: "https://www.imdb.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  describe("OpenGraph data", () => {
    it("extracts og:type as video.movie", () => {
      expect(result.data.og.type).toBe("video.movie");
    });

    it("extracts og:title", () => {
      expect(result.data.og.title).toBe("The Matrix (1999)");
    });

    it("extracts og:site_name", () => {
      expect(result.data.og.siteName).toBe("IMDb");
    });

    it("extracts og:image with dimensions", () => {
      expect(result.data.og.images).toHaveLength(1);
      expect(result.data.og.images[0].url).toBe(
        "https://m.media-amazon.com/images/M/MV5matrix.jpg"
      );
      expect(result.data.og.images[0].width).toBe(1000);
      expect(result.data.og.images[0].height).toBe(1500);
    });
  });

  describe("Video data", () => {
    it("extracts video duration", () => {
      expect(result.data.video).toBeDefined();
      expect(result.data.video?.duration).toBe(8160);
    });

    it("extracts video directors", () => {
      expect(result.data.video?.directors).toBeDefined();
      expect(result.data.video?.directors).toHaveLength(2);
      expect(result.data.video?.directors?.[0]).toBe(
        "https://www.imdb.com/name/nm0905154/"
      );
      expect(result.data.video?.directors?.[1]).toBe(
        "https://www.imdb.com/name/nm0905152/"
      );
    });

    it("extracts video actors", () => {
      expect(result.data.video?.actors).toBeDefined();
      expect(result.data.video?.actors).toHaveLength(2);
      expect(result.data.video?.actors?.[0].url).toBe(
        "https://www.imdb.com/name/nm0000206/"
      );
      expect(result.data.video?.actors?.[1].url).toBe(
        "https://www.imdb.com/name/nm0000401/"
      );
    });

    it("extracts video tags", () => {
      expect(result.data.video?.tags).toBeDefined();
      expect(result.data.video?.tags).toEqual(["Sci-Fi", "Action"]);
    });

    it("extracts video release date", () => {
      expect(result.data.video?.releaseDate).toBe("1999-03-31");
    });
  });

  it("extracts twitter:card as summary_large_image", () => {
    expect(result.data.twitter.card).toBe("summary_large_image");
  });

  it("extracts JSON-LD with Movie type", () => {
    expect(result.data.jsonLd).toBeDefined();
    expect(result.data.jsonLd?.items).toHaveLength(1);
    expect(result.data.jsonLd?.items?.[0]?.type).toBe("Movie");
    expect(result.data.jsonLd?.items?.[0]?.name).toBe("The Matrix");
  });
});

describe("Real-world: Airbnb listing", () => {
  const result = extractFromHtml(realWorldFixtures.airbnbListing, {
    baseUrl: "https://www.airbnb.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("extracts og:title", () => {
    expect(result.data.og.title).toBe("Cozy Mountain Cabin");
  });

  it("extracts og:site_name", () => {
    expect(result.data.og.siteName).toBe("Airbnb");
  });

  it("extracts 3 og:images", () => {
    expect(result.data.og.images).toHaveLength(3);
    expect(result.data.og.images[0].url).toBe(
      "https://a0.muscache.com/im/pictures/example1.jpg"
    );
    expect(result.data.og.images[1].url).toBe(
      "https://a0.muscache.com/im/pictures/example2.jpg"
    );
    expect(result.data.og.images[2].url).toBe(
      "https://a0.muscache.com/im/pictures/example3.jpg"
    );
  });

  it("extracts og:locale", () => {
    expect(result.data.og.locale).toBe("en_US");
  });

  it("extracts 4 og:locale:alternate values", () => {
    expect(result.data.og.localeAlternate).toBeDefined();
    expect(result.data.og.localeAlternate).toHaveLength(4);
    expect(result.data.og.localeAlternate).toEqual([
      "es_ES",
      "fr_FR",
      "de_DE",
      "ja_JP",
    ]);
  });

  it("has iOS app links defined", () => {
    expect(result.data.appLinks).toBeDefined();
    expect(result.data.appLinks?.ios).toBeDefined();
    expect(result.data.appLinks?.ios?.[0]?.appStoreId).toBe("401626263");
    expect(result.data.appLinks?.ios?.[0]?.appName).toBe("Airbnb");
  });

  it("has Android app links defined", () => {
    expect(result.data.appLinks?.android).toBeDefined();
    expect(result.data.appLinks?.android?.[0]?.package).toBe(
      "com.airbnb.android"
    );
    expect(result.data.appLinks?.android?.[0]?.appName).toBe("Airbnb");
  });
});

describe("Real-world: Pinterest pin", () => {
  const result = extractFromHtml(realWorldFixtures.pinterestPin, {
    baseUrl: "https://www.pinterest.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("extracts og:type as article", () => {
    expect(result.data.og.type).toBe("article");
  });

  it("extracts og:title", () => {
    expect(result.data.og.title).toBe("Beautiful Landscape Photography");
  });

  it("extracts og:site_name", () => {
    expect(result.data.og.siteName).toBe("Pinterest");
  });

  it("extracts RSS feeds", () => {
    expect(result.data.feeds).toBeDefined();
    expect(result.data.feeds?.feeds).toHaveLength(1);
    expect(result.data.feeds?.feeds[0].type).toBe("rss");
    expect(result.data.feeds?.feeds[0].title).toBe("Pinterest Feed");
    expect(result.data.feeds?.feeds[0].url).toBe(
      "https://www.pinterest.com/feed/rss"
    );
  });

  it("has iOS app links defined", () => {
    expect(result.data.appLinks).toBeDefined();
    expect(result.data.appLinks?.ios).toBeDefined();
    expect(result.data.appLinks?.ios?.[0]?.appStoreId).toBe("429047995");
    expect(result.data.appLinks?.ios?.[0]?.appName).toBe("Pinterest");
  });

  it("has Android app links defined", () => {
    expect(result.data.appLinks?.android).toBeDefined();
    expect(result.data.appLinks?.android?.[0]?.package).toBe("com.pinterest");
    expect(result.data.appLinks?.android?.[0]?.appName).toBe("Pinterest");
  });
});

describe("Real-world: TikTok video", () => {
  const result = extractFromHtml(realWorldFixtures.tiktokVideo, {
    baseUrl: "https://www.tiktok.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  describe("OpenGraph data", () => {
    it("extracts og:type as video.other", () => {
      expect(result.data.og.type).toBe("video.other");
    });

    it("extracts og:title", () => {
      expect(result.data.og.title).toBe("Funny Dance Video");
    });

    it("extracts og:site_name", () => {
      expect(result.data.og.siteName).toBe("TikTok");
    });

    it("extracts og:videos", () => {
      expect(result.data.og.videos).toBeDefined();
      expect(result.data.og.videos).toHaveLength(1);
      expect(result.data.og.videos?.[0].url).toBe(
        "https://www.tiktok.com/embed/v2/7123456789012345678"
      );
      expect(result.data.og.videos?.[0].type).toBe("text/html");
      expect(result.data.og.videos?.[0].width).toBe(340);
      expect(result.data.og.videos?.[0].height).toBe(600);
    });
  });

  describe("Twitter data", () => {
    it("extracts twitter:card as player", () => {
      expect(result.data.twitter.card).toBe("player");
    });

    it("extracts twitter:site", () => {
      expect(result.data.twitter.site).toBe("@tiktok_us");
    });

    it("extracts twitter:player", () => {
      expect(result.data.twitter.player).toBeDefined();
      expect(result.data.twitter.player?.url).toBe(
        "https://www.tiktok.com/embed/v2/7123456789012345678"
      );
      expect(result.data.twitter.player?.width).toBe(340);
      expect(result.data.twitter.player?.height).toBe(600);
    });
  });

  describe("App links", () => {
    it("has iOS app links defined", () => {
      expect(result.data.appLinks).toBeDefined();
      expect(result.data.appLinks?.ios).toBeDefined();
      expect(result.data.appLinks?.ios?.[0]?.appStoreId).toBe("835599320");
      expect(result.data.appLinks?.ios?.[0]?.appName).toBe("TikTok");
      expect(result.data.appLinks?.ios?.[0]?.url).toBe(
        "snssdk1128://video/7123456789012345678"
      );
    });

    it("has Android app links defined", () => {
      expect(result.data.appLinks?.android).toBeDefined();
      expect(result.data.appLinks?.android?.[0]?.package).toBe(
        "com.zhiliaoapp.musically"
      );
      expect(result.data.appLinks?.android?.[0]?.appName).toBe("TikTok");
      expect(result.data.appLinks?.android?.[0]?.url).toBe(
        "snssdk1128://video/7123456789012345678"
      );
    });
  });
});

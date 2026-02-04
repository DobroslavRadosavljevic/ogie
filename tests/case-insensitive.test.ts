import { describe, expect, it } from "bun:test";

import { extractFromHtml, type ExtractSuccess } from "../src";

describe("Case-Insensitive - OpenGraph", () => {
  const html = `
    <html><head>
      <meta property="OG:TITLE" content="Upper Title" />
      <meta property="Og:Description" content="Mixed Description" />
      <meta property="og:TYPE" content="article" />
      <meta property="OG:URL" content="https://example.com" />
      <meta property="OG:SITE_NAME" content="Upper Site" />
      <meta property="OG:IMAGE" content="https://example.com/img.png" />
      <meta property="OG:IMAGE:WIDTH" content="800" />
      <meta property="OG:IMAGE:HEIGHT" content="600" />
      <meta property="OG:LOCALE" content="en_US" />
    </head></html>
  `;
  const result = extractFromHtml(html, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("extracts uppercase og:title", () => {
    expect(result.data.og.title).toBe("Upper Title");
  });

  it("extracts mixed-case og:description", () => {
    expect(result.data.og.description).toBe("Mixed Description");
  });

  it("extracts og:type", () => {
    expect(result.data.og.type).toBe("article");
  });

  it("extracts og:url", () => {
    expect(result.data.og.url).toBe("https://example.com");
  });

  it("extracts og:site_name", () => {
    expect(result.data.og.siteName).toBe("Upper Site");
  });

  it("extracts og:image with dimensions", () => {
    expect(result.data.og.images).toHaveLength(1);
    expect(result.data.og.images[0].url).toBe("https://example.com/img.png");
    expect(result.data.og.images[0].width).toBe(800);
    expect(result.data.og.images[0].height).toBe(600);
  });

  it("extracts og:locale", () => {
    expect(result.data.og.locale).toBe("en_US");
  });
});

describe("Case-Insensitive - Twitter Card", () => {
  const html = `
    <html><head>
      <meta name="TWITTER:CARD" content="summary_large_image" />
      <meta name="Twitter:Title" content="Twitter Title" />
      <meta name="twitter:DESCRIPTION" content="Twitter Desc" />
      <meta name="TWITTER:SITE" content="@example" />
      <meta name="Twitter:Creator" content="@author" />
      <meta name="TWITTER:IMAGE" content="https://example.com/tw.png" />
    </head></html>
  `;
  const result = extractFromHtml(html, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("extracts twitter:card", () => {
    expect(result.data.twitter.card).toBe("summary_large_image");
  });

  it("extracts twitter:title", () => {
    expect(result.data.twitter.title).toBe("Twitter Title");
  });

  it("extracts twitter:description", () => {
    expect(result.data.twitter.description).toBe("Twitter Desc");
  });

  it("extracts twitter:site", () => {
    expect(result.data.twitter.site).toBe("@example");
  });

  it("extracts twitter:creator", () => {
    expect(result.data.twitter.creator).toBe("@author");
  });

  it("extracts twitter:image", () => {
    expect(result.data.twitter.image?.url).toBe("https://example.com/tw.png");
  });
});

describe("Case-Insensitive - Article", () => {
  const html = `
    <html><head>
      <meta property="og:type" content="article" />
      <meta property="ARTICLE:PUBLISHED_TIME" content="2024-01-15T10:00:00Z" />
      <meta property="Article:Author" content="https://example.com/author/jane" />
      <meta property="ARTICLE:SECTION" content="Technology" />
      <meta property="Article:Tag" content="JavaScript" />
    </head></html>
  `;
  const result = extractFromHtml(html, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("extracts article:published_time", () => {
    expect(result.data.article?.publishedTime).toBe("2024-01-15T10:00:00Z");
  });

  it("extracts article:author", () => {
    expect(result.data.article?.author).toBe("https://example.com/author/jane");
  });

  it("extracts article:section", () => {
    expect(result.data.article?.section).toBe("Technology");
  });

  it("extracts article:tag", () => {
    expect(result.data.article?.tags).toEqual(["JavaScript"]);
  });
});

describe("Case-Insensitive - Book", () => {
  const html = `
    <html><head>
      <meta property="BOOK:ISBN" content="978-3-16-148410-0" />
      <meta property="Book:Author" content="https://example.com/author/bob" />
      <meta property="BOOK:RELEASE_DATE" content="2024-06-01" />
      <meta property="Book:Tag" content="Fiction" />
    </head></html>
  `;
  const result = extractFromHtml(html, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("extracts book:isbn", () => {
    expect(result.data.book?.isbn).toBe("978-3-16-148410-0");
  });

  it("extracts book:author", () => {
    expect(result.data.book?.authors).toEqual([
      "https://example.com/author/bob",
    ]);
  });

  it("extracts book:release_date", () => {
    expect(result.data.book?.releaseDate).toBe("2024-06-01");
  });

  it("extracts book:tag", () => {
    expect(result.data.book?.tags).toEqual(["Fiction"]);
  });
});

describe("Case-Insensitive - Music", () => {
  const html = `
    <html><head>
      <meta property="og:type" content="music.song" />
      <meta property="MUSIC:DURATION" content="240" />
      <meta property="Music:Album" content="https://example.com/album/1" />
      <meta property="MUSIC:MUSICIAN" content="https://example.com/artist/1" />
    </head></html>
  `;
  const result = extractFromHtml(html, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("extracts music:duration", () => {
    expect(result.data.music?.duration).toBe(240);
  });

  it("extracts music:album", () => {
    expect(result.data.music?.albums).toHaveLength(1);
    expect(result.data.music?.albums?.[0]?.url).toBe(
      "https://example.com/album/1"
    );
  });

  it("extracts music:musician", () => {
    expect(result.data.music?.musicians).toEqual([
      "https://example.com/artist/1",
    ]);
  });
});

describe("Case-Insensitive - Profile", () => {
  const html = `
    <html><head>
      <meta property="og:type" content="profile" />
      <meta property="PROFILE:FIRST_NAME" content="Jane" />
      <meta property="Profile:Last_Name" content="Doe" />
      <meta property="PROFILE:USERNAME" content="janedoe" />
      <meta property="Profile:Gender" content="female" />
    </head></html>
  `;
  const result = extractFromHtml(html, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("extracts profile:first_name", () => {
    expect(result.data.profile?.firstName).toBe("Jane");
  });

  it("extracts profile:last_name", () => {
    expect(result.data.profile?.lastName).toBe("Doe");
  });

  it("extracts profile:username", () => {
    expect(result.data.profile?.username).toBe("janedoe");
  });

  it("extracts profile:gender", () => {
    expect(result.data.profile?.gender).toBe("female");
  });
});

describe("Case-Insensitive - Video", () => {
  const html = `
    <html><head>
      <meta property="og:type" content="video.movie" />
      <meta property="VIDEO:DURATION" content="7200" />
      <meta property="Video:Director" content="https://example.com/director/1" />
      <meta property="VIDEO:ACTOR" content="https://example.com/actor/1" />
      <meta property="VIDEO:TAG" content="Drama" />
    </head></html>
  `;
  const result = extractFromHtml(html, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("extracts video:duration", () => {
    expect(result.data.video?.duration).toBe(7200);
  });

  it("extracts video:director", () => {
    expect(result.data.video?.directors).toEqual([
      "https://example.com/director/1",
    ]);
  });

  it("extracts video:actor", () => {
    expect(result.data.video?.actors).toHaveLength(1);
    expect(result.data.video?.actors?.[0]?.url).toBe(
      "https://example.com/actor/1"
    );
  });

  it("extracts video:tag", () => {
    expect(result.data.video?.tags).toEqual(["Drama"]);
  });
});

describe("Case-Insensitive - App Links", () => {
  const html = `
    <html><head>
      <meta property="AL:IOS:URL" content="myapp://content/123" />
      <meta property="AL:IOS:APP_STORE_ID" content="123456" />
      <meta property="Al:Android:Package" content="com.example.app" />
      <meta property="AL:ANDROID:URL" content="myapp://content/123" />
      <meta property="Al:Web:Url" content="https://example.com/content/123" />
    </head></html>
  `;
  const result = extractFromHtml(html, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("extracts al:ios data", () => {
    expect(result.data.appLinks?.ios).toBeDefined();
    expect(result.data.appLinks?.ios?.[0]?.url).toBe("myapp://content/123");
    expect(result.data.appLinks?.ios?.[0]?.appStoreId).toBe("123456");
  });

  it("extracts al:android data", () => {
    expect(result.data.appLinks?.android).toBeDefined();
    expect(result.data.appLinks?.android?.[0]?.package).toBe("com.example.app");
    expect(result.data.appLinks?.android?.[0]?.url).toBe("myapp://content/123");
  });

  it("extracts al:web data", () => {
    expect(result.data.appLinks?.web).toBeDefined();
    expect(result.data.appLinks?.web?.[0]?.url).toBe(
      "https://example.com/content/123"
    );
  });
});

describe("Case-Insensitive - Basic Meta", () => {
  const html = `
    <html><head>
      <title>Page Title</title>
      <meta name="DESCRIPTION" content="Upper Description" />
      <meta name="Author" content="John Doe" />
      <meta name="KEYWORDS" content="test, upper" />
      <meta name="Robots" content="index, follow" />
      <meta name="VIEWPORT" content="width=device-width" />
      <meta http-equiv="CONTENT-TYPE" content="text/html; charset=utf-8" />
    </head></html>
  `;
  const result = extractFromHtml(html, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("extracts uppercase description", () => {
    expect(result.data.basic.description).toBe("Upper Description");
  });

  it("extracts mixed-case author", () => {
    expect(result.data.basic.author).toBe("John Doe");
  });

  it("extracts uppercase keywords", () => {
    expect(result.data.basic.keywords).toBe("test, upper");
  });

  it("extracts mixed-case robots", () => {
    expect(result.data.basic.robots).toBe("index, follow");
  });

  it("extracts uppercase viewport", () => {
    expect(result.data.basic.viewport).toBe("width=device-width");
  });

  it("extracts charset from uppercase http-equiv", () => {
    expect(result.data.basic.charset).toBe("utf8");
  });
});

describe("Case-Insensitive - Mixed Case Document", () => {
  const html = `
    <html><head>
      <title>Mixed Case Page</title>
      <meta property="OG:TITLE" content="OG Title" />
      <meta property="og:description" content="Normal OG desc" />
      <meta name="TWITTER:CARD" content="summary" />
      <meta name="twitter:title" content="Normal Twitter title" />
      <meta name="Description" content="Basic desc" />
      <meta property="ARTICLE:AUTHOR" content="https://example.com/author" />
    </head></html>
  `;
  const result = extractFromHtml(html, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("extracts mix of uppercase and lowercase OG tags", () => {
    expect(result.data.og.title).toBe("OG Title");
    expect(result.data.og.description).toBe("Normal OG desc");
  });

  it("extracts mix of uppercase and lowercase Twitter tags", () => {
    expect(result.data.twitter.card).toBe("summary");
    expect(result.data.twitter.title).toBe("Normal Twitter title");
  });

  it("extracts mixed-case basic meta", () => {
    expect(result.data.basic.description).toBe("Basic desc");
  });

  it("extracts uppercase article tags", () => {
    expect(result.data.article?.author).toBe("https://example.com/author");
  });
});

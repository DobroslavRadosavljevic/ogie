import { describe, expect, it } from "bun:test";

import { extractFromHtml, type ExtractSuccess } from "../src";
import { structuredTypeFixtures } from "./data/structured-types";

// =============================================================================
// Book
// =============================================================================

describe("Structured Types - Book Complete", () => {
  const result = extractFromHtml(structuredTypeFixtures.bookComplete, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("has book data defined", () => {
    expect(result.data.book).toBeDefined();
  });

  it("extracts isbn", () => {
    expect(result.data.book?.isbn).toBe("978-3-16-148410-0");
  });

  it("extracts 2 authors", () => {
    expect(result.data.book?.authors).toHaveLength(2);
  });

  it("extracts 3 tags", () => {
    expect(result.data.book?.tags).toHaveLength(3);
  });

  it("extracts releaseDate", () => {
    expect(result.data.book?.releaseDate).toBe("2024-06-15");
  });
});

describe("Structured Types - Book ISBN Formats", () => {
  const result = extractFromHtml(structuredTypeFixtures.bookIsbnFormats, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("extracts ISBN-10 format", () => {
    expect(result.data.book?.isbn).toBe("0-306-40615-2");
  });
});

describe("Structured Types - Book Multiple Authors & Tags (Dedup)", () => {
  const result = extractFromHtml(
    structuredTypeFixtures.bookMultipleAuthorsTags,
    { baseUrl: "https://example.com" }
  ) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("deduplicates authors (6 entries -> 5 unique)", () => {
    expect(result.data.book?.authors).toHaveLength(5);
  });

  it("deduplicates tags (6 entries -> 5 unique)", () => {
    expect(result.data.book?.tags).toHaveLength(5);
  });
});

// =============================================================================
// Profile
// =============================================================================

describe("Structured Types - Profile Complete", () => {
  const result = extractFromHtml(structuredTypeFixtures.profileComplete, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("has profile data defined", () => {
    expect(result.data.profile).toBeDefined();
  });

  it("extracts firstName", () => {
    expect(result.data.profile?.firstName).toBe("Jane");
  });

  it("extracts lastName", () => {
    expect(result.data.profile?.lastName).toBe("Smith");
  });

  it("extracts username", () => {
    expect(result.data.profile?.username).toBe("janesmith");
  });

  it("extracts gender", () => {
    expect(result.data.profile?.gender).toBe("female");
  });
});

describe("Structured Types - Profile Gender Edge Cases", () => {
  const result = extractFromHtml(
    structuredTypeFixtures.profileGenderEdgeCases,
    { baseUrl: "https://example.com" }
  ) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("rejects invalid gender 'other' (only male/female valid)", () => {
    expect(result.data.profile?.gender).toBeUndefined();
  });
});

// =============================================================================
// Video
// =============================================================================

describe("Structured Types - Video Movie Complete", () => {
  const result = extractFromHtml(structuredTypeFixtures.videoMovieComplete, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("has video data defined", () => {
    expect(result.data.video).toBeDefined();
  });

  it("extracts duration as number", () => {
    expect(result.data.video?.duration).toBe(7200);
  });

  it("extracts 2 directors", () => {
    expect(result.data.video?.directors).toHaveLength(2);
  });

  it("extracts 1 writer", () => {
    expect(result.data.video?.writers).toHaveLength(1);
  });

  it("extracts 2 actors", () => {
    expect(result.data.video?.actors).toHaveLength(2);
  });

  it("extracts 2 tags", () => {
    expect(result.data.video?.tags).toHaveLength(2);
  });
});

describe("Structured Types - Video Episode with Series", () => {
  const result = extractFromHtml(structuredTypeFixtures.videoEpisodeSeries, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("has video series defined", () => {
    expect(result.data.video?.series).toBeDefined();
  });

  it("extracts duration", () => {
    expect(result.data.video?.duration).toBe(3600);
  });
});

describe("Structured Types - Video Actors Mixed Roles", () => {
  const result = extractFromHtml(structuredTypeFixtures.videoActorsMixedRoles, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("extracts 3 actors", () => {
    expect(result.data.video?.actors).toHaveLength(3);
  });

  it("first actor has role 'Hero'", () => {
    expect(result.data.video?.actors?.[0]?.role).toBe("Hero");
  });

  it("second actor has no role", () => {
    expect(result.data.video?.actors?.[1]?.role).toBeUndefined();
  });

  it("third actor has role 'Villain'", () => {
    expect(result.data.video?.actors?.[2]?.role).toBe("Villain");
  });
});

// =============================================================================
// Music
// =============================================================================

describe("Structured Types - Music Song Complete", () => {
  const result = extractFromHtml(structuredTypeFixtures.musicSongComplete, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("has music data defined", () => {
    expect(result.data.music).toBeDefined();
  });

  it("extracts duration", () => {
    expect(result.data.music?.duration).toBe(240);
  });

  it("extracts album with disc and track", () => {
    expect(result.data.music?.albums).toBeDefined();
    expect(result.data.music?.albums).toHaveLength(1);
    expect(result.data.music?.albums?.[0]?.disc).toBe(1);
    expect(result.data.music?.albums?.[0]?.track).toBe(5);
  });

  it("extracts 2 musicians", () => {
    expect(result.data.music?.musicians).toHaveLength(2);
  });
});

describe("Structured Types - Music Album Complete", () => {
  const result = extractFromHtml(structuredTypeFixtures.musicAlbumComplete, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("extracts 3 songs", () => {
    expect(result.data.music?.songs).toHaveLength(3);
  });

  it("first song has disc=1 track=1", () => {
    expect(result.data.music?.songs?.[0]?.disc).toBe(1);
    expect(result.data.music?.songs?.[0]?.track).toBe(1);
  });

  it("second song has disc=1 track=2", () => {
    expect(result.data.music?.songs?.[1]?.disc).toBe(1);
    expect(result.data.music?.songs?.[1]?.track).toBe(2);
  });

  it("third song has disc=2 track=1", () => {
    expect(result.data.music?.songs?.[2]?.disc).toBe(2);
    expect(result.data.music?.songs?.[2]?.track).toBe(1);
  });

  it("extracts musician", () => {
    expect(result.data.music?.musicians).toBeDefined();
  });

  it("extracts releaseDate", () => {
    expect(result.data.music?.releaseDate).toBeDefined();
  });
});

describe("Structured Types - Music Playlist", () => {
  const result = extractFromHtml(structuredTypeFixtures.musicPlaylist, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("extracts 2 songs", () => {
    expect(result.data.music?.songs).toHaveLength(2);
  });

  it("extracts creator", () => {
    expect(result.data.music?.creator).toBeDefined();
  });
});

describe("Structured Types - Music Radio Station", () => {
  const result = extractFromHtml(structuredTypeFixtures.musicRadioStation, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("extracts creator", () => {
    expect(result.data.music?.creator).toBeDefined();
  });
});

import { describe, expect, it } from "bun:test";

import { extractFromHtml } from "../src";
import {
  fallbackFixtures,
  fixtures,
  opengraphFixtures,
  twitterFixtures,
} from "./data";

const BASE_URL = "https://example.com";

describe("extraction modes - compatibility parity", () => {
  type ParitySample = readonly [sampleName: string, sampleHtml: string];

  const samples = [
    ["opengraph fixture", fixtures.opengraph],
    ["twitter fixture", fixtures.twitter],
    ["basic fixture", fixtures.basic],
    ["fallback ogFromTwitter fixture", fallbackFixtures.ogFromTwitter],
    ["opengraph multiple images fixture", opengraphFixtures.ogMultipleImages],
    ["twitter mixed attributes fixture", twitterFixtures.mixedAttrs],
  ] satisfies readonly ParitySample[];

  it.each(samples)(
    "keeps output parity for sample: %s",
    (sampleName, sampleHtml) => {
      const legacy = extractFromHtml(sampleHtml, { baseUrl: BASE_URL });
      const explicitBestEffort = extractFromHtml(sampleHtml, {
        baseUrl: BASE_URL,
        mode: "best-effort",
      });

      expect(explicitBestEffort, sampleName).toEqual(legacy);
    }
  );
});

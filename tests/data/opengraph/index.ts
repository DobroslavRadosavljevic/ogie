import { readFileSync } from "node:fs";
import { join } from "node:path";

const dataDir = import.meta.dir;

const loadFixture = (name: string): string =>
  readFileSync(join(dataDir, name), "utf8");

export const opengraphFixtures = {
  ogAudioComplete: loadFixture("og-audio-complete.html"),
  ogCaseSensitivity: loadFixture("og-case-sensitivity.html"),
  ogDeterminerVariants: loadFixture("og-determiner-variants.html"),
  ogDuplicateTitles: loadFixture("og-duplicate-titles.html"),
  ogEmptyValues: loadFixture("og-empty-values.html"),
  ogImageAllProperties: loadFixture("og-image-all-properties.html"),
  ogInvalidUrls: loadFixture("og-invalid-urls.html"),
  ogMissingRequired: loadFixture("og-missing-required.html"),
  ogMultipleImages: loadFixture("og-multiple-images.html"),
  ogNameVsProperty: loadFixture("og-name-vs-property.html"),
  ogProtocolRelative: loadFixture("og-protocol-relative.html"),
  ogRelativeUrls: loadFixture("og-relative-urls.html"),
  ogUnknownType: loadFixture("og-unknown-type.html"),
  ogVideoComplete: loadFixture("og-video-complete.html"),
} as const;

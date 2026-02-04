import { readFileSync } from "node:fs";
import { join } from "node:path";

const dataDir = import.meta.dir;

const loadFixture = (name: string): string =>
  readFileSync(join(dataDir, name), "utf8");

export const twitterFixtures = {
  summaryMinimal: loadFixture("twitter-summary-minimal.html"),
  propertyAttr: loadFixture("twitter-property-attr.html"),
  invalidCardType: loadFixture("twitter-invalid-card-type.html"),
  imageWithAlt: loadFixture("twitter-image-with-alt.html"),
  missingRequired: loadFixture("twitter-missing-required.html"),
  emptyValues: loadFixture("twitter-empty-values.html"),
  mixedAttrs: loadFixture("twitter-mixed-attrs.html"),
} as const;

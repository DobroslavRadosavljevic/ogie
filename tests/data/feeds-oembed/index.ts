import { readFileSync } from "node:fs";
import { join } from "node:path";

const dataDir = import.meta.dir;

const loadFixture = (name: string): string =>
  readFileSync(join(dataDir, name), "utf8");

export const feedsOembedFixtures = {
  feedsMissingAttributes: loadFixture("feeds-missing-attributes.html"),
  feedsMultipleFormats: loadFixture("feeds-multiple-formats.html"),
  feedsRssAtomJson: loadFixture("feeds-rss-atom-json.html"),
  feedsWordpressPattern: loadFixture("feeds-wordpress-pattern.html"),
  oembedJsonOnly: loadFixture("oembed-json-only.html"),
  oembedMultipleLinks: loadFixture("oembed-multiple-links.html"),
  oembedRelativeUrls: loadFixture("oembed-relative-urls.html"),
  oembedXmlOnly: loadFixture("oembed-xml-only.html"),
} as const;

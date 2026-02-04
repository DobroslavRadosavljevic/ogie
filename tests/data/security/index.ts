import { readFileSync } from "node:fs";
import { join } from "node:path";

const dataDir = import.meta.dir;

const loadFixture = (name: string): string =>
  readFileSync(join(dataDir, name), "utf8");

export const securityFixtures = {
  ssrfPrivateUrls: loadFixture("ssrf-private-urls.html"),
  xssDataUri: loadFixture("xss-data-uri.html"),
  xssInJsonld: loadFixture("xss-in-jsonld.html"),
  xssInMetaContent: loadFixture("xss-in-meta-content.html"),
  xssInOgTitle: loadFixture("xss-in-og-title.html"),
  xssJavascriptUrls: loadFixture("xss-javascript-urls.html"),
} as const;

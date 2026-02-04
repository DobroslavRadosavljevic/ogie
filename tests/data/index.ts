import { readFileSync } from "node:fs";
import { join } from "node:path";

const dataDir = import.meta.dir;

const loadFixture = (name: string): string =>
  readFileSync(join(dataDir, name), "utf8");

export const fixtures = {
  appLinks: loadFixture("app-links.html"),
  article: loadFixture("article.html"),
  basic: loadFixture("basic.html"),
  basicExtended: loadFixture("basic-extended.html"),
  dublinCore: loadFixture("dublin-core.html"),
  fallback: loadFixture("fallback.html"),
  favicon: loadFixture("favicon.html"),
  jsonLd: loadFixture("jsonld.html"),
  oEmbed: loadFixture("oembed.html"),
  opengraph: loadFixture("opengraph.html"),
  opengraphExtended: loadFixture("opengraph-extended.html"),
  twitter: loadFixture("twitter.html"),
  twitterApp: loadFixture("twitter-app.html"),
  twitterPlayer: loadFixture("twitter-player.html"),
} as const;

export { edgeCaseFixtures } from "./edge-cases";
export { opengraphFixtures } from "./opengraph";
export { twitterFixtures } from "./twitter";
export { jsonldFixtures } from "./jsonld";
export { realWorldFixtures } from "./real-world";
export { structuredTypeFixtures } from "./structured-types";
export { feedsOembedFixtures } from "./feeds-oembed";
export { appLinksFixtures } from "./app-links";
export { dublinCoreFixtures } from "./dublin-core";
export { securityFixtures } from "./security";
export { urlHandlingFixtures } from "./url-handling";
export { encodingFixtures } from "./encoding";
export { fallbackFixtures } from "./fallbacks";
export { faviconFixtures } from "./favicon";

import { readFileSync } from "node:fs";
import { join } from "node:path";

const dataDir = import.meta.dir;

const loadFixture = (name: string): string =>
  readFileSync(join(dataDir, name), "utf8");

export const urlHandlingFixtures = {
  urlAbsoluteMixed: loadFixture("url-absolute-mixed.html"),
  urlDoubleEncoded: loadFixture("url-double-encoded.html"),
  urlFragmentOnly: loadFixture("url-fragment-only.html"),
  urlInternationalIdn: loadFixture("url-international-idn.html"),
  urlNoBaseUrl: loadFixture("url-no-base-url.html"),
  urlProtocolRelative: loadFixture("url-protocol-relative.html"),
  urlQueryStrings: loadFixture("url-query-strings.html"),
  urlRelativePaths: loadFixture("url-relative-paths.html"),
} as const;

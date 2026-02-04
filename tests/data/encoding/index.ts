import { readFileSync } from "node:fs";
import { join } from "node:path";

const dataDir = import.meta.dir;

const loadFixture = (name: string): string =>
  readFileSync(join(dataDir, name), "utf8");

export const encodingFixtures = {
  httpEquiv: loadFixture("encoding-http-equiv.html"),
  metaCharsetVariations: loadFixture("encoding-meta-charset-variations.html"),
  mixedDeclarations: loadFixture("encoding-mixed-declarations.html"),
  utf8Bom: loadFixture("encoding-utf8-bom.html"),
} as const;

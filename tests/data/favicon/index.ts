import { readFileSync } from "node:fs";
import { join } from "node:path";

const dataDir = import.meta.dir;

const loadFixture = (name: string): string =>
  readFileSync(join(dataDir, name), "utf8");

export const faviconFixtures = {
  dataUriSvg: loadFixture("favicon-data-uri-svg.html"),
  multipleSizes: loadFixture("favicon-multiple-sizes.html"),
  noType: loadFixture("favicon-no-type.html"),
  unusualRels: loadFixture("favicon-unusual-rels.html"),
} as const;

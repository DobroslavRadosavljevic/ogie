import { readFileSync } from "node:fs";
import { join } from "node:path";

const dataDir = import.meta.dir;

const loadFixture = (name: string): string =>
  readFileSync(join(dataDir, name), "utf8");

export const dublinCoreFixtures = {
  dcFullDcterms: loadFixture("dc-full-dcterms.html"),
  dcLinkRelation: loadFixture("dc-link-relation.html"),
  dcMixedCaseVariants: loadFixture("dc-mixed-case-variants.html"),
  dcMultipleValues: loadFixture("dc-multiple-values.html"),
} as const;

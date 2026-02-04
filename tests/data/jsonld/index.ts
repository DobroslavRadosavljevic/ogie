import { readFileSync } from "node:fs";
import { join } from "node:path";

const dataDir = import.meta.dir;

const loadFixture = (name: string): string =>
  readFileSync(join(dataDir, name), "utf8");

export const jsonldFixtures = {
  arrayRoot: loadFixture("jsonld-array-root.html"),
  breadcrumbList: loadFixture("jsonld-breadcrumb-list.html"),
  circularRefs: loadFixture("jsonld-circular-refs.html"),
  emptyScript: loadFixture("jsonld-empty-script.html"),
  event: loadFixture("jsonld-event.html"),
  faqPage: loadFixture("jsonld-faq-page.html"),
  imageObject: loadFixture("jsonld-image-object.html"),
  localBusiness: loadFixture("jsonld-local-business.html"),
  malformedJson: loadFixture("jsonld-malformed-json.html"),
  missingContext: loadFixture("jsonld-missing-context.html"),
  multipleBlocks: loadFixture("jsonld-multiple-blocks.html"),
  nestedGraph: loadFixture("jsonld-nested-graph.html"),
  product: loadFixture("jsonld-product.html"),
  recipe: loadFixture("jsonld-recipe.html"),
} as const;

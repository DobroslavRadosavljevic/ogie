import { readFileSync } from "node:fs";
import { join } from "node:path";

const dataDir = import.meta.dir;

const loadFixture = (name: string): string =>
  readFileSync(join(dataDir, name), "utf8");

export const edgeCaseFixtures = {
  cdataSections: loadFixture("cdata-sections.html"),
  emptyDocument: loadFixture("empty-document.html"),
  extremelyLongValues: loadFixture("extremely-long-values.html"),
  htmlEntitiesInMeta: loadFixture("html-entities-in-meta.html"),
  malformedBrokenNesting: loadFixture("malformed-broken-nesting.html"),
  malformedCommentsInMeta: loadFixture("malformed-comments-in-meta.html"),
  malformedMissingDoctype: loadFixture("malformed-missing-doctype.html"),
  malformedNoHead: loadFixture("malformed-no-head.html"),
  malformedOnlyBody: loadFixture("malformed-only-body.html"),
  malformedSelfClosingVariants: loadFixture(
    "malformed-self-closing-variants.html"
  ),
  malformedUnclosedTags: loadFixture("malformed-unclosed-tags.html"),
  specialCharactersUnicode: loadFixture("special-characters-unicode.html"),
  svgEmbedded: loadFixture("svg-embedded.html"),
  whitespaceOnlyValues: loadFixture("whitespace-only-values.html"),
} as const;

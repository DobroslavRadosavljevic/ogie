import { readFileSync } from "node:fs";
import { join } from "node:path";

const dataDir = import.meta.dir;

const loadFixture = (name: string): string =>
  readFileSync(join(dataDir, name), "utf8");

export const fallbackFixtures = {
  chainPriority: loadFixture("fallback-chain-priority.html"),
  ogFromBasic: loadFixture("fallback-og-from-basic.html"),
  ogFromTwitter: loadFixture("fallback-og-from-twitter.html"),
  onlyOpengraphMode: loadFixture("fallback-only-opengraph-mode.html"),
} as const;

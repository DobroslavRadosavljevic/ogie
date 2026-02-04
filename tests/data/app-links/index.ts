import { readFileSync } from "node:fs";
import { join } from "node:path";

const dataDir = import.meta.dir;

const loadFixture = (name: string): string =>
  readFileSync(join(dataDir, name), "utf8");

export const appLinksFixtures = {
  alAllPlatforms: loadFixture("al-all-platforms.html"),
  alMultipleIosApps: loadFixture("al-multiple-ios-apps.html"),
  alPartialData: loadFixture("al-partial-data.html"),
  alWindowsUniversal: loadFixture("al-windows-universal.html"),
} as const;

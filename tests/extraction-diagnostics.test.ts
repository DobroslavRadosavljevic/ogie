import { describe, expect, it } from "bun:test";

import {
  extractFromHtmlWithDiagnostics,
  type ExtractWithDiagnosticsResult,
} from "../src";
import { fallbackFixtures, opengraphFixtures, twitterFixtures } from "./data";

const BASE_URL = "https://example.com";

const expectSuccess = (
  result: ExtractWithDiagnosticsResult
): Exclude<ExtractWithDiagnosticsResult, { success: false }> => {
  expect(result.success).toBe(true);
  return result as Exclude<ExtractWithDiagnosticsResult, { success: false }>;
};

const extractDiagnostics = (
  html: string,
  mode?: "best-effort" | "platform-valid"
): Exclude<ExtractWithDiagnosticsResult, { success: false }> =>
  expectSuccess(
    extractFromHtmlWithDiagnostics(html, {
      baseUrl: BASE_URL,
      ...(mode ? { mode } : {}),
    })
  );

const findInvalidField = (
  result: Exclude<ExtractWithDiagnosticsResult, { success: false }>,
  fieldPath: string
) =>
  result.diagnostics.invalidFields.find(
    (field) => field.fieldPath === fieldPath
  );

const strictModeFixture = `<!doctype html><html><head>
  <meta property="og:title" content="OG title" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="ftp://example.com/og-url" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Twitter title" />
  <meta name="twitter:site" content="invalid-handle" />
  <meta name="twitter:image" content="ftp://example.com/twitter.jpg" />
</head><body></body></html>`;

describe("extractFromHtmlWithDiagnostics", () => {
  it("reports missing OG required fields", () => {
    const result = extractDiagnostics(opengraphFixtures.ogMissingRequired);

    expect(
      result.diagnostics.missingRequiredFields.some(
        (field) => field.fieldPath === "og.title"
      )
    ).toBe(true);
    expect(
      result.diagnostics.missingRequiredFields.some(
        (field) => field.fieldPath === "og.url"
      )
    ).toBe(true);
  });

  it("reports invalid OG URLs", () => {
    const result = extractDiagnostics(opengraphFixtures.ogInvalidUrls);

    const invalidImageUrlField = result.diagnostics.invalidFields.find(
      (field) => field.fieldPath === "og.images[0].url"
    );

    expect(invalidImageUrlField?.rule).toBe("OG_INVALID_URL");
  });

  it("reports fallback usage warnings", () => {
    const result = extractDiagnostics(fallbackFixtures.ogFromTwitter);

    expect(
      result.diagnostics.warnings.some(
        (warning) => warning.rule === "SOCIAL_FALLBACK_USED"
      )
    ).toBe(true);
  });

  it("reports non-canonical attribute warnings", () => {
    const result = extractDiagnostics(twitterFixtures.propertyAttr);

    expect(
      result.diagnostics.warnings.some(
        (warning) => warning.rule === "SOCIAL_NON_CANONICAL_ATTRIBUTE"
      )
    ).toBe(true);
  });

  it("reports social tags outside <head>", () => {
    const html = `<!doctype html><html><head></head><body>
      <meta property="og:title" content="Body OG" />
    </body></html>`;

    const result = extractDiagnostics(html);

    expect(
      result.diagnostics.warnings.some(
        (warning) => warning.rule === "SOCIAL_OUTSIDE_HEAD"
      )
    ).toBe(true);
  });

  it("applies platform-valid filtering while returning diagnostics", () => {
    const result = extractDiagnostics(
      opengraphFixtures.ogInvalidUrls,
      "platform-valid"
    );

    expect(result.data.og.url).toBe("https://example.com/not%20a%20url");
    expect(result.data.og.images).toHaveLength(0);
    expect(result.diagnostics.summary.invalid).toBeGreaterThan(0);
  });

  it("keeps diagnostics reporting stable across modes while only platform-valid filters output", () => {
    const bestEffort = extractDiagnostics(
      opengraphFixtures.ogInvalidUrls,
      "best-effort"
    );
    const platformValid = extractDiagnostics(
      opengraphFixtures.ogInvalidUrls,
      "platform-valid"
    );

    expect(bestEffort.data.og.images[0]?.url).toBe(
      "ftp://example.com/image.jpg"
    );
    expect(platformValid.data.og.images).toHaveLength(0);

    const bestEffortInvalidImage = findInvalidField(
      bestEffort,
      "og.images[0].url"
    );
    const platformValidInvalidImage = findInvalidField(
      platformValid,
      "og.images[0].url"
    );

    expect(bestEffortInvalidImage?.rule).toBe("OG_INVALID_URL");
    expect(platformValidInvalidImage?.rule).toBe("OG_INVALID_URL");
  });
});

describe("extractFromHtmlWithDiagnostics regression checks", () => {
  it("uses TWITTER_DUPLICATE_SINGLETON for duplicate Twitter singleton tags", () => {
    const html = `<!doctype html><html><head>
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content="First title" />
      <meta name="twitter:title" content="Second title" />
    </head><body></body></html>`;

    const result = extractDiagnostics(html);
    const titleWarnings = result.diagnostics.warnings.filter(
      (warning) => warning.fieldPath === "twitter.title"
    );
    const duplicateTwitterTitleWarning = titleWarnings.find((warning) =>
      warning.message.includes("Duplicate twitter:title")
    );

    expect(duplicateTwitterTitleWarning?.rule).toBe(
      "TWITTER_DUPLICATE_SINGLETON"
    );
  });

  it("deduplicates OG missing-required fields when required tags are empty", () => {
    const html = `<!doctype html><html><head>
      <meta property="og:type" content="website" />
      <meta property="og:title" content="   " />
      <meta property="og:url" content="" />
      <meta property="og:image" content="" />
    </head><body></body></html>`;

    const result = extractDiagnostics(html);
    const ogTitleMissing = result.diagnostics.missingRequiredFields.filter(
      (field) => field.fieldPath === "og.title"
    );
    const ogUrlMissing = result.diagnostics.missingRequiredFields.filter(
      (field) => field.fieldPath === "og.url"
    );
    const ogImagesMissing = result.diagnostics.missingRequiredFields.filter(
      (field) => field.fieldPath === "og.images"
    );

    expect(ogTitleMissing).toHaveLength(1);
    expect(ogUrlMissing).toHaveLength(1);
    expect(ogImagesMissing).toHaveLength(1);
  });

  it("keeps invalid social fields in best-effort output diagnostics", () => {
    const result = extractDiagnostics(strictModeFixture, "best-effort");
    const ogUrlInvalid = findInvalidField(result, "og.url");
    const twitterSiteInvalid = findInvalidField(result, "twitter.site");

    expect(result.data.og.url).toBe("ftp://example.com/og-url");
    expect(result.data.twitter.site).toBe("invalid-handle");
    expect(ogUrlInvalid?.keptInOutput).toBe(true);
    expect(twitterSiteInvalid?.keptInOutput).toBe(true);
  });

  it("marks filtered invalid social fields as not kept in platform-valid mode", () => {
    const result = extractDiagnostics(strictModeFixture, "platform-valid");
    const ogUrlInvalid = findInvalidField(result, "og.url");
    const twitterSiteInvalid = findInvalidField(result, "twitter.site");

    expect(result.data.og.url).toBeUndefined();
    expect(result.data.twitter.site).toBeUndefined();
    expect(ogUrlInvalid?.keptInOutput).toBe(false);
    expect(twitterSiteInvalid?.keptInOutput).toBe(false);
  });

  it("does not warn for non-canonical Twitter attribute when both name and property are present", () => {
    const html = `<!doctype html><html><head>
      <meta name="twitter:card" property="twitter:card" content="summary" />
      <meta name="twitter:title" property="twitter:title" content="Canonical title" />
    </head><body></body></html>`;

    const result = extractDiagnostics(html);
    const nonCanonicalWarnings = result.diagnostics.warnings.filter(
      (warning) => warning.rule === "SOCIAL_NON_CANONICAL_ATTRIBUTE"
    );

    expect(nonCanonicalWarnings).toHaveLength(0);
  });
});

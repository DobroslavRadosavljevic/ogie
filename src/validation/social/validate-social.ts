import type {
  BasicMetaData,
  Metadata,
  MissingRequiredFieldReport,
  OpenGraphAudio,
  OpenGraphData,
  OpenGraphVideo,
  SocialRuleCode,
  SocialValidationReport,
  SourceTagLocation,
  TwitterCardData,
  ValidationWarningReport,
} from "../../types";
import type { IndexedSocialTag, SocialTagIndex } from "./types";

import {
  OG_REQUIRED_FIELDS,
  TWITTER_REQUIRED_FIELDS,
  hasAnyValidOgImage,
  hasValidTwitterAppId,
  hasValidTwitterImage,
  hasValidTwitterPlayer,
  isMalformedOgType,
  isPositiveInteger,
  isStandardOgType,
  isStrictSocialUrl,
  isValidNumericId,
  isValidOgDeterminer,
  isValidTwitterCard,
  isValidTwitterHandle,
} from "./rules";

export interface ValidateSocialMetadataInput {
  metadata: Metadata;
  outputSocial?: Pick<Metadata, "og" | "twitter">;
  rawOg: OpenGraphData;
  rawTwitter: TwitterCardData;
  rawBasic: BasicMetaData;
  tagIndex: SocialTagIndex;
}

const SINGLETON_META_KEYS = new Set([
  "og:title",
  "og:type",
  "og:url",
  "og:description",
  "og:site_name",
  "og:locale",
  "og:determiner",
  "twitter:card",
  "twitter:title",
  "twitter:description",
  "twitter:site",
  "twitter:site:id",
  "twitter:creator",
  "twitter:creator:id",
  "twitter:image",
  "twitter:image:alt",
  "twitter:player",
  "twitter:player:width",
  "twitter:player:height",
  "twitter:player:stream",
  "twitter:player:stream:content_type",
]);

const keyToFieldPath = (key: string): `og.${string}` | `twitter.${string}` => {
  if (key.startsWith("og:image")) {
    return "og.images";
  }
  if (key.startsWith("og:video")) {
    return "og.videos";
  }
  if (key.startsWith("og:audio")) {
    return "og.audio";
  }
  if (key.startsWith("og:")) {
    return `og.${key.slice(3).replaceAll(":", ".")}`;
  }
  return `twitter.${key.slice("twitter:".length).replaceAll(":", ".")}`;
};

const toSourceTagLocation = (tag: IndexedSocialTag): SourceTagLocation => ({
  attrName: tag.attrName,
  attrValue: tag.attrValue,
  canonicalAttribute: tag.canonicalAttribute,
  content: tag.content,
  inHead: tag.inHead,
  normalizedAttrValue: tag.normalizedAttrValue,
  tagIndex: tag.tagIndex,
});

const createSyntheticSource = (
  fieldPath: string,
  content: string
): SourceTagLocation => ({
  attrName: "property",
  attrValue: fieldPath,
  canonicalAttribute: true,
  content,
  inHead: true,
  normalizedAttrValue: fieldPath,
  tagIndex: -1,
});

const getSourcesByKey = (
  tagIndex: SocialTagIndex,
  key: string
): SourceTagLocation[] =>
  (tagIndex[key] ?? []).map((tag) => toSourceTagLocation(tag));

const getPrimarySource = (
  tagIndex: SocialTagIndex,
  key: string,
  fallbackPath: string,
  fallbackContent = ""
): SourceTagLocation =>
  getSourcesByKey(tagIndex, key)[0] ??
  createSyntheticSource(fallbackPath, fallbackContent);

const addMissingRequired = (
  missingRequiredFields: MissingRequiredFieldReport[],
  fieldPath: `og.${string}` | `twitter.${string}`,
  expectedTags: string[],
  when?: string
): void => {
  const duplicate = missingRequiredFields.some(
    (field) => field.fieldPath === fieldPath && field.when === when
  );
  if (duplicate) {
    return;
  }

  missingRequiredFields.push({
    expectedTags,
    fieldPath,
    namespace: fieldPath.startsWith("og.") ? "og" : "twitter",
    requirementLevel: "spec",
    severity: "error",
    ...(when && { when }),
  });
};

const addWarning = (
  warnings: ValidationWarningReport[],
  seenWarnings: Set<string>,
  warning: ValidationWarningReport,
  uniqueKey: string
): void => {
  if (seenWarnings.has(uniqueKey)) {
    return;
  }
  seenWarnings.add(uniqueKey);
  warnings.push(warning);
};

const getDuplicateSingletonRule = (metaKey: string): SocialRuleCode =>
  metaKey.startsWith("twitter:")
    ? "TWITTER_DUPLICATE_SINGLETON"
    : "OG_DUPLICATE_SINGLETON";

const getOutputValue = (
  outputSocial: Pick<Metadata, "og" | "twitter">,
  fieldPath: `og.${string}` | `twitter.${string}`
): unknown => {
  const pathSegments = fieldPath
    .replaceAll(/\[(\d+)\]/g, ".$1")
    .split(".")
    .filter(Boolean);

  let current: unknown = outputSocial;
  for (const segment of pathSegments) {
    if (current === undefined || current === null) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
};

const isFieldKeptInOutput = (
  outputSocial: Pick<Metadata, "og" | "twitter">,
  fieldPath: `og.${string}` | `twitter.${string}`
): boolean => getOutputValue(outputSocial, fieldPath) !== undefined;

// eslint-disable-next-line max-statements -- Validation warning synthesis intentionally groups all warning families.
const collectMetadataWarnings = (
  input: ValidateSocialMetadataInput,
  warnings: ValidationWarningReport[],
  seenWarnings: Set<string>
): void => {
  for (const [metaKey, tags] of Object.entries(input.tagIndex)) {
    if (SINGLETON_META_KEYS.has(metaKey) && tags.length > 1) {
      addWarning(
        warnings,
        seenWarnings,
        {
          fieldPath: keyToFieldPath(metaKey),
          message: `Duplicate ${metaKey} tags found; first value wins`,
          namespace: metaKey.startsWith("og:") ? "og" : "twitter",
          rule: getDuplicateSingletonRule(metaKey),
          sources: tags.map((tag) => toSourceTagLocation(tag)),
        },
        `duplicate:${metaKey}`
      );
    }

    for (const tag of tags) {
      if (!tag.canonicalAttribute) {
        addWarning(
          warnings,
          seenWarnings,
          {
            fieldPath: keyToFieldPath(metaKey),
            message: `${metaKey} was discovered via non-canonical attribute ${tag.attrName}`,
            namespace: tag.namespace,
            rule: "SOCIAL_NON_CANONICAL_ATTRIBUTE",
            sources: [toSourceTagLocation(tag)],
          },
          `canonical:${metaKey}:${tag.tagIndex}`
        );
      }

      if (!tag.inHead) {
        addWarning(
          warnings,
          seenWarnings,
          {
            fieldPath: keyToFieldPath(metaKey),
            message: `${metaKey} is outside <head> and may be ignored by crawlers`,
            namespace: tag.namespace,
            rule: "SOCIAL_OUTSIDE_HEAD",
            sources: [toSourceTagLocation(tag)],
          },
          `outside-head:${metaKey}:${tag.tagIndex}`
        );
      }
    }
  }

  if (
    input.metadata.og.title &&
    !input.rawOg.title &&
    (input.rawTwitter.title || input.rawBasic.title)
  ) {
    addWarning(
      warnings,
      seenWarnings,
      {
        fieldPath: "og.title",
        message: "og:title was filled by fallback data",
        namespace: "cross",
        rule: "SOCIAL_FALLBACK_USED",
      },
      "fallback:og:title"
    );
  }

  if (
    input.metadata.og.description &&
    !input.rawOg.description &&
    (input.rawTwitter.description || input.rawBasic.description)
  ) {
    addWarning(
      warnings,
      seenWarnings,
      {
        fieldPath: "og.description",
        message: "og:description was filled by fallback data",
        namespace: "cross",
        rule: "SOCIAL_FALLBACK_USED",
      },
      "fallback:og:description"
    );
  }

  if (
    input.metadata.og.type &&
    !isStandardOgType(input.metadata.og.type) &&
    !isMalformedOgType(input.metadata.og.type)
  ) {
    addWarning(
      warnings,
      seenWarnings,
      {
        fieldPath: "og.type",
        message: `og:type "${input.metadata.og.type}" is non-standard`,
        namespace: "og",
        rule: "OG_NON_STANDARD_TYPE",
        sources: getSourcesByKey(input.tagIndex, "og:type"),
      },
      `og-type:${input.metadata.og.type}`
    );
  }
};

const collectRawTagInvalids = (
  input: ValidateSocialMetadataInput,
  report: SocialValidationReport
): void => {
  for (const [metaKey, tags] of Object.entries(input.tagIndex)) {
    for (const tag of tags) {
      const trimmed = tag.content.trim();
      if (trimmed === "") {
        report.invalidFields.push({
          fieldPath: keyToFieldPath(metaKey),
          keptInOutput: false,
          namespace: tag.namespace,
          rawValue: tag.content,
          reason: "Empty content is ignored",
          rule: "SOCIAL_EMPTY_CONTENT_IGNORED",
          source: toSourceTagLocation(tag),
        });
      }

      if (
        metaKey === "twitter:card" &&
        trimmed &&
        !isValidTwitterCard(trimmed)
      ) {
        report.invalidFields.push({
          fieldPath: "twitter.card",
          keptInOutput: false,
          namespace: "twitter",
          rawValue: trimmed,
          reason: "Invalid twitter:card value",
          rule: "TWITTER_INVALID_CARD",
          source: toSourceTagLocation(tag),
        });
      }

      if (
        metaKey === "og:determiner" &&
        trimmed &&
        !isValidOgDeterminer(trimmed)
      ) {
        report.invalidFields.push({
          fieldPath: "og.determiner",
          keptInOutput: false,
          namespace: "og",
          rawValue: trimmed,
          reason: "Invalid og:determiner value",
          rule: "OG_INVALID_DETERMINER",
          source: toSourceTagLocation(tag),
        });
      }
    }
  }
};

const checkUrlField = (
  report: SocialValidationReport,
  outputSocial: Pick<Metadata, "og" | "twitter">,
  value: string | undefined,
  fieldPath: `og.${string}` | `twitter.${string}`,
  key: string,
  rule: SocialRuleCode
): void => {
  if (!value) {
    return;
  }

  if (isStrictSocialUrl(value)) {
    report.validFields.push({
      fieldPath,
      fromFallback: false,
      namespace: fieldPath.startsWith("og.") ? "og" : "twitter",
      source: getPrimarySource(
        report.sourceTags as SocialTagIndex,
        key,
        fieldPath,
        value
      ),
      value,
    });
    return;
  }

  report.invalidFields.push({
    fieldPath,
    keptInOutput: isFieldKeptInOutput(outputSocial, fieldPath),
    namespace: fieldPath.startsWith("og.") ? "og" : "twitter",
    rawValue: value,
    reason: "Value is not a valid public HTTP(S) URL",
    rule,
    source: getPrimarySource(
      report.sourceTags as SocialTagIndex,
      key,
      fieldPath,
      value
    ),
  });
};

const checkMediaUrls = (
  report: SocialValidationReport,
  outputSocial: Pick<Metadata, "og" | "twitter">,
  media: OpenGraphVideo[] | OpenGraphAudio[] | undefined,
  keyPrefix: "og:video" | "og:audio",
  fieldPathPrefix: "og.videos" | "og.audio"
): void => {
  if (!media) {
    return;
  }

  for (const [index, item] of media.entries()) {
    checkUrlField(
      report,
      outputSocial,
      item.url,
      `${fieldPathPrefix}[${String(index)}].url`,
      keyPrefix,
      "OG_INVALID_URL"
    );

    if (item.secureUrl) {
      checkUrlField(
        report,
        outputSocial,
        item.secureUrl,
        `${fieldPathPrefix}[${String(index)}].secureUrl`,
        `${keyPrefix}:secure_url`,
        "OG_INVALID_URL"
      );
    }
  }
};

// eslint-disable-next-line complexity, max-statements -- Validation logic is intentionally explicit for auditability.
const collectOgValidation = (
  input: ValidateSocialMetadataInput,
  report: SocialValidationReport,
  outputSocial: Pick<Metadata, "og" | "twitter">
): void => {
  const { og } = input.metadata;

  if (og.title) {
    report.validFields.push({
      fieldPath: "og.title",
      fromFallback: !input.rawOg.title,
      namespace: "og",
      source: getPrimarySource(
        report.sourceTags as SocialTagIndex,
        "og:title",
        "og.title",
        og.title
      ),
      value: og.title,
    });
  }

  if (og.type) {
    report.validFields.push({
      fieldPath: "og.type",
      fromFallback: false,
      namespace: "og",
      source: getPrimarySource(
        report.sourceTags as SocialTagIndex,
        "og:type",
        "og.type",
        og.type
      ),
      value: og.type,
    });
  }

  if (og.description) {
    report.validFields.push({
      fieldPath: "og.description",
      fromFallback: !input.rawOg.description,
      namespace: "og",
      source: getPrimarySource(
        report.sourceTags as SocialTagIndex,
        "og:description",
        "og.description",
        og.description
      ),
      value: og.description,
    });
  }

  checkUrlField(
    report,
    outputSocial,
    og.url,
    "og.url",
    "og:url",
    "OG_INVALID_URL"
  );

  if (og.determiner) {
    report.validFields.push({
      fieldPath: "og.determiner",
      fromFallback: false,
      namespace: "og",
      source: getPrimarySource(
        report.sourceTags as SocialTagIndex,
        "og:determiner",
        "og.determiner",
        og.determiner
      ),
      value: og.determiner,
    });
  }

  for (const [index, image] of og.images.entries()) {
    checkUrlField(
      report,
      outputSocial,
      image.url,
      `og.images[${String(index)}].url`,
      "og:image",
      "OG_INVALID_URL"
    );

    if (image.secureUrl) {
      checkUrlField(
        report,
        outputSocial,
        image.secureUrl,
        `og.images[${String(index)}].secureUrl`,
        "og:image:secure_url",
        "OG_INVALID_URL"
      );
    }
  }

  checkMediaUrls(report, outputSocial, og.videos, "og:video", "og.videos");
  checkMediaUrls(report, outputSocial, og.audio, "og:audio", "og.audio");

  if (!og.title) {
    addMissingRequired(report.missingRequiredFields, "og.title", ["og:title"]);
  }
  if (!og.type) {
    addMissingRequired(report.missingRequiredFields, "og.type", ["og:type"]);
  }
  if (!og.url || !isStrictSocialUrl(og.url)) {
    addMissingRequired(report.missingRequiredFields, "og.url", ["og:url"]);
  }
  if (!hasAnyValidOgImage(og)) {
    addMissingRequired(report.missingRequiredFields, "og.images", ["og:image"]);
  }

  for (const requiredField of OG_REQUIRED_FIELDS) {
    if (!(requiredField in report.sourceTags)) {
      continue;
    }

    const hasNonEmptyValue = report.sourceTags[requiredField].some(
      (source) => source.content.trim() !== ""
    );
    if (!hasNonEmptyValue) {
      addMissingRequired(
        report.missingRequiredFields,
        keyToFieldPath(requiredField),
        [requiredField]
      );
    }
  }
};

// eslint-disable-next-line complexity, max-statements -- Validation logic is intentionally explicit for auditability.
const collectTwitterValidation = (
  input: ValidateSocialMetadataInput,
  report: SocialValidationReport,
  outputSocial: Pick<Metadata, "og" | "twitter">
): void => {
  const { twitter } = input.metadata;

  if (twitter.card && isValidTwitterCard(twitter.card)) {
    report.validFields.push({
      fieldPath: "twitter.card",
      fromFallback: false,
      namespace: "twitter",
      source: getPrimarySource(
        report.sourceTags as SocialTagIndex,
        "twitter:card",
        "twitter.card",
        twitter.card
      ),
      value: twitter.card,
    });
  }

  if (twitter.title) {
    report.validFields.push({
      fieldPath: "twitter.title",
      fromFallback: false,
      namespace: "twitter",
      source: getPrimarySource(
        report.sourceTags as SocialTagIndex,
        "twitter:title",
        "twitter.title",
        twitter.title
      ),
      value: twitter.title,
    });
  }

  if (twitter.site) {
    if (isValidTwitterHandle(twitter.site)) {
      report.validFields.push({
        fieldPath: "twitter.site",
        fromFallback: false,
        namespace: "twitter",
        source: getPrimarySource(
          report.sourceTags as SocialTagIndex,
          "twitter:site",
          "twitter.site",
          twitter.site
        ),
        value: twitter.site,
      });
    } else {
      report.invalidFields.push({
        fieldPath: "twitter.site",
        keptInOutput: isFieldKeptInOutput(outputSocial, "twitter.site"),
        namespace: "twitter",
        rawValue: twitter.site,
        reason: "twitter:site must be a valid handle",
        rule: "TWITTER_INVALID_HANDLE",
        source: getPrimarySource(
          report.sourceTags as SocialTagIndex,
          "twitter:site",
          "twitter.site",
          twitter.site
        ),
      });
    }
  }

  if (twitter.creator) {
    if (isValidTwitterHandle(twitter.creator)) {
      report.validFields.push({
        fieldPath: "twitter.creator",
        fromFallback: false,
        namespace: "twitter",
        source: getPrimarySource(
          report.sourceTags as SocialTagIndex,
          "twitter:creator",
          "twitter.creator",
          twitter.creator
        ),
        value: twitter.creator,
      });
    } else {
      report.invalidFields.push({
        fieldPath: "twitter.creator",
        keptInOutput: isFieldKeptInOutput(outputSocial, "twitter.creator"),
        namespace: "twitter",
        rawValue: twitter.creator,
        reason: "twitter:creator must be a valid handle",
        rule: "TWITTER_INVALID_HANDLE",
        source: getPrimarySource(
          report.sourceTags as SocialTagIndex,
          "twitter:creator",
          "twitter.creator",
          twitter.creator
        ),
      });
    }
  }

  if (twitter.siteId && !isValidNumericId(twitter.siteId)) {
    report.invalidFields.push({
      fieldPath: "twitter.siteId",
      keptInOutput: isFieldKeptInOutput(outputSocial, "twitter.siteId"),
      namespace: "twitter",
      rawValue: twitter.siteId,
      reason: "twitter:site:id must be numeric",
      rule: "TWITTER_INVALID_ID",
      source: getPrimarySource(
        report.sourceTags as SocialTagIndex,
        "twitter:site:id",
        "twitter.siteId",
        twitter.siteId
      ),
    });
  }

  if (twitter.creatorId && !isValidNumericId(twitter.creatorId)) {
    report.invalidFields.push({
      fieldPath: "twitter.creatorId",
      keptInOutput: isFieldKeptInOutput(outputSocial, "twitter.creatorId"),
      namespace: "twitter",
      rawValue: twitter.creatorId,
      reason: "twitter:creator:id must be numeric",
      rule: "TWITTER_INVALID_ID",
      source: getPrimarySource(
        report.sourceTags as SocialTagIndex,
        "twitter:creator:id",
        "twitter.creatorId",
        twitter.creatorId
      ),
    });
  }

  checkUrlField(
    report,
    outputSocial,
    twitter.image?.url,
    "twitter.image.url",
    "twitter:image",
    "TWITTER_INVALID_URL"
  );

  if (twitter.player) {
    checkUrlField(
      report,
      outputSocial,
      twitter.player.url,
      "twitter.player.url",
      "twitter:player",
      "TWITTER_INVALID_URL"
    );

    if (twitter.player.stream) {
      checkUrlField(
        report,
        outputSocial,
        twitter.player.stream,
        "twitter.player.stream",
        "twitter:player:stream",
        "TWITTER_INVALID_URL"
      );
    }

    if (
      twitter.player.width !== undefined &&
      !isPositiveInteger(twitter.player.width)
    ) {
      report.invalidFields.push({
        fieldPath: "twitter.player.width",
        keptInOutput: isFieldKeptInOutput(outputSocial, "twitter.player.width"),
        namespace: "twitter",
        rawValue: String(twitter.player.width),
        reason: "twitter:player:width must be a positive integer",
        rule: "TWITTER_MISSING_REQUIRED",
        source: getPrimarySource(
          report.sourceTags as SocialTagIndex,
          "twitter:player:width",
          "twitter.player.width",
          String(twitter.player.width)
        ),
      });
    }

    if (
      twitter.player.height !== undefined &&
      !isPositiveInteger(twitter.player.height)
    ) {
      report.invalidFields.push({
        fieldPath: "twitter.player.height",
        keptInOutput: isFieldKeptInOutput(
          outputSocial,
          "twitter.player.height"
        ),
        namespace: "twitter",
        rawValue: String(twitter.player.height),
        reason: "twitter:player:height must be a positive integer",
        rule: "TWITTER_MISSING_REQUIRED",
        source: getPrimarySource(
          report.sourceTags as SocialTagIndex,
          "twitter:player:height",
          "twitter.player.height",
          String(twitter.player.height)
        ),
      });
    }
  }

  if (!twitter.card || !isValidTwitterCard(twitter.card)) {
    addMissingRequired(report.missingRequiredFields, "twitter.card", [
      "twitter:card",
    ]);
    return;
  }

  const required = TWITTER_REQUIRED_FIELDS[twitter.card];
  const when = `twitter.card=${twitter.card}`;

  for (const requiredKey of required) {
    if (requiredKey === "twitter:title" && !twitter.title) {
      addMissingRequired(
        report.missingRequiredFields,
        "twitter.title",
        [requiredKey],
        when
      );
    }

    if (requiredKey === "twitter:image" && !hasValidTwitterImage(twitter)) {
      addMissingRequired(
        report.missingRequiredFields,
        "twitter.image",
        [requiredKey],
        when
      );
    }

    if (requiredKey === "twitter:player" && !twitter.player?.url) {
      addMissingRequired(
        report.missingRequiredFields,
        "twitter.player.url",
        [requiredKey],
        when
      );
    }

    if (
      requiredKey === "twitter:player:width" &&
      !isPositiveInteger(twitter.player?.width)
    ) {
      addMissingRequired(
        report.missingRequiredFields,
        "twitter.player.width",
        [requiredKey],
        when
      );
    }

    if (
      requiredKey === "twitter:player:height" &&
      !isPositiveInteger(twitter.player?.height)
    ) {
      addMissingRequired(
        report.missingRequiredFields,
        "twitter.player.height",
        [requiredKey],
        when
      );
    }

    if (requiredKey === "twitter:app:id" && !hasValidTwitterAppId(twitter)) {
      addMissingRequired(
        report.missingRequiredFields,
        "twitter.app",
        [requiredKey],
        when
      );
    }
  }

  if (twitter.card === "player" && !hasValidTwitterPlayer(twitter)) {
    addMissingRequired(
      report.missingRequiredFields,
      "twitter.player",
      ["twitter:player", "twitter:player:width", "twitter:player:height"],
      when
    );
  }
};

const toSourceTags = (
  tagIndex: SocialTagIndex
): Record<string, SourceTagLocation[]> =>
  Object.fromEntries(
    Object.entries(tagIndex).map(([key, tags]) => [
      key,
      tags.map((tag) => toSourceTagLocation(tag)),
    ])
  );

export const validateSocialMetadata = (
  input: ValidateSocialMetadataInput
): SocialValidationReport => {
  const outputSocial = input.outputSocial ?? {
    og: input.metadata.og,
    twitter: input.metadata.twitter,
  };

  const report: SocialValidationReport = {
    invalidFields: [],
    missingRequiredFields: [],
    sourceTags: toSourceTags(input.tagIndex),
    summary: {
      invalid: 0,
      missingRequired: 0,
      valid: 0,
      warnings: 0,
    },
    validFields: [],
    version: 1,
    warnings: [],
  };

  collectRawTagInvalids(input, report);
  collectOgValidation(input, report, outputSocial);
  collectTwitterValidation(input, report, outputSocial);

  const seenWarnings = new Set<string>();
  collectMetadataWarnings(input, report.warnings, seenWarnings);

  report.summary = {
    invalid: report.invalidFields.length,
    missingRequired: report.missingRequiredFields.length,
    valid: report.validFields.length,
    warnings: report.warnings.length,
  };

  return report;
};

import type { CheerioAPI } from "cheerio";
import type { AnyNode } from "domhandler";

import {
  SOURCE_PRIORITY_ATTRS,
  type IndexedSocialTag,
  type SocialNamespace,
  type SocialTagIndex,
} from "./types";

const getSocialNamespace = (key: string): SocialNamespace | undefined => {
  if (key.startsWith("og:")) {
    return "og";
  }
  if (key.startsWith("twitter:")) {
    return "twitter";
  }
  return undefined;
};

const isCanonicalAttribute = (
  namespace: SocialNamespace,
  attrName: "property" | "name"
): boolean =>
  (namespace === "og" && attrName === "property") ||
  (namespace === "twitter" && attrName === "name");

const hasCanonicalCompanionAttribute = (
  $: CheerioAPI,
  element: AnyNode,
  namespace: SocialNamespace,
  normalizedAttrValue: string
): boolean => {
  const canonicalAttrName = namespace === "og" ? "property" : "name";
  const canonicalAttrValue = $(element).attr(canonicalAttrName)?.trim();
  return canonicalAttrValue?.toLowerCase() === normalizedAttrValue;
};

const pickKey = (
  $: CheerioAPI,
  element: AnyNode
): { attrName: "property" | "name"; attrValue: string } | undefined => {
  for (const attrName of SOURCE_PRIORITY_ATTRS) {
    const attrValue = $(element).attr(attrName)?.trim();
    if (attrValue) {
      return { attrName, attrValue };
    }
  }
  return undefined;
};

const toIndexRecord = (
  $: CheerioAPI,
  element: AnyNode,
  tagIndex: number
): IndexedSocialTag | undefined => {
  const picked = pickKey($, element);
  if (!picked) {
    return undefined;
  }

  const normalizedAttrValue = picked.attrValue.toLowerCase();
  const namespace = getSocialNamespace(normalizedAttrValue);
  if (!namespace) {
    return undefined;
  }

  const content = $(element).attr("content") ?? "";

  return {
    attrName: picked.attrName,
    attrValue: picked.attrValue,
    canonicalAttribute:
      isCanonicalAttribute(namespace, picked.attrName) ||
      hasCanonicalCompanionAttribute(
        $,
        element,
        namespace,
        normalizedAttrValue
      ),
    content,
    inHead: $(element).closest("head").length > 0,
    namespace,
    normalizedAttrValue,
    tagIndex,
  };
};

export const collectSocialTagIndex = ($: CheerioAPI): SocialTagIndex => {
  const index: SocialTagIndex = {};
  let tagIndex = 0;

  $("meta").each((_, element) => {
    const record = toIndexRecord($, element, tagIndex);
    if (!record) {
      return;
    }

    const existing = index[record.normalizedAttrValue] ?? [];
    existing.push(record);
    index[record.normalizedAttrValue] = existing;
    tagIndex += 1;
  });

  return index;
};

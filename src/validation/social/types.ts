export type SocialNamespace = "og" | "twitter";

export interface IndexedSocialTag {
  tagIndex: number;
  attrName: "property" | "name";
  attrValue: string;
  normalizedAttrValue: string;
  content: string;
  inHead: boolean;
  canonicalAttribute: boolean;
  namespace: SocialNamespace;
}

export type SocialTagIndex = Record<string, IndexedSocialTag[]>;

export const SOURCE_PRIORITY_ATTRS = ["property", "name"] as const;

export const createSourceRecord = (
  key: string,
  tags: IndexedSocialTag[]
): [string, IndexedSocialTag[]] => [key, tags];

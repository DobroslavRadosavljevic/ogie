import type {
  OpenGraphAudio,
  OpenGraphData,
  OpenGraphImage,
  OpenGraphVideo,
  TwitterCardData,
  TwitterCardType,
} from "../../types";

import { isPrivateUrl, isValidUrl } from "../../utils/url";

export const VALID_OG_DETERMINERS = new Set(["a", "an", "the", "", "auto"]);

export const VALID_TWITTER_CARD_TYPES = new Set<TwitterCardType>([
  "summary",
  "summary_large_image",
  "app",
  "player",
]);

export const STANDARD_OG_TYPES = new Set([
  "website",
  "article",
  "book",
  "profile",
  "music.song",
  "music.album",
  "music.playlist",
  "music.radio_station",
  "video.movie",
  "video.episode",
  "video.tv_show",
  "video.other",
]);

export const OG_REQUIRED_FIELDS = [
  "og:title",
  "og:type",
  "og:url",
  "og:image",
] as const;

export const TWITTER_REQUIRED_FIELDS: Record<TwitterCardType, string[]> = {
  app: ["twitter:title", "twitter:app:id"],
  player: [
    "twitter:title",
    "twitter:image",
    "twitter:player",
    "twitter:player:width",
    "twitter:player:height",
  ],
  summary: ["twitter:title"],
  summary_large_image: ["twitter:title", "twitter:image"],
};

export const isValidOgDeterminer = (value: string | undefined): boolean =>
  value !== undefined && VALID_OG_DETERMINERS.has(value);

export const isValidTwitterCard = (
  value: string | undefined
): value is TwitterCardType =>
  value !== undefined && VALID_TWITTER_CARD_TYPES.has(value as TwitterCardType);

export const isStandardOgType = (value: string | undefined): boolean => {
  if (!value) {
    return false;
  }
  return STANDARD_OG_TYPES.has(value);
};

export const isMalformedOgType = (value: string | undefined): boolean => {
  if (!value) {
    return false;
  }
  return !/^[a-z][a-z0-9_.:-]*$/i.test(value);
};

export const isStrictSocialUrl = (value: string | undefined): boolean => {
  if (!value || !isValidUrl(value)) {
    return false;
  }
  return !isPrivateUrl(value);
};

export const isValidTwitterHandle = (value: string | undefined): boolean => {
  if (!value) {
    return false;
  }
  return /^@[A-Za-z0-9_]{1,15}$/.test(value);
};

export const isValidNumericId = (value: string | undefined): boolean => {
  if (!value) {
    return false;
  }
  return /^[0-9]+$/.test(value);
};

export const isPositiveInteger = (value: number | undefined): boolean =>
  value !== undefined && Number.isInteger(value) && value > 0;

export const hasValidOgImage = (image: OpenGraphImage): boolean =>
  isStrictSocialUrl(image.url);

export const hasValidOgVideo = (video: OpenGraphVideo): boolean =>
  isStrictSocialUrl(video.url);

export const hasValidOgAudio = (audio: OpenGraphAudio): boolean =>
  isStrictSocialUrl(audio.url);

export const hasAnyValidOgImage = (og: OpenGraphData): boolean =>
  og.images.some(hasValidOgImage);

export const hasValidTwitterImage = (twitter: TwitterCardData): boolean =>
  isStrictSocialUrl(twitter.image?.url);

export const hasValidTwitterPlayer = (twitter: TwitterCardData): boolean =>
  isStrictSocialUrl(twitter.player?.url) &&
  isPositiveInteger(twitter.player?.width) &&
  isPositiveInteger(twitter.player?.height);

export const hasValidTwitterAppId = (twitter: TwitterCardData): boolean =>
  Boolean(
    twitter.app?.iphone?.id ||
    twitter.app?.ipad?.id ||
    twitter.app?.googleplay?.id
  );

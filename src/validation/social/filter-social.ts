import type {
  Metadata,
  OpenGraphAudio,
  OpenGraphData,
  OpenGraphImage,
  OpenGraphVideo,
  TwitterApp,
  TwitterAppPlatform,
  TwitterCardData,
} from "../../types";

import {
  isPositiveInteger,
  isStrictSocialUrl,
  isValidNumericId,
  isValidOgDeterminer,
  isValidTwitterCard,
  isValidTwitterHandle,
} from "./rules";

const filterOpenGraphImages = (images: OpenGraphImage[]): OpenGraphImage[] =>
  images
    .filter((image) => isStrictSocialUrl(image.url))
    .map((image) => ({
      ...image,
      ...(image.secureUrl && isStrictSocialUrl(image.secureUrl)
        ? { secureUrl: image.secureUrl }
        : { secureUrl: undefined }),
    }));

const filterOpenGraphMedia = <T extends OpenGraphVideo | OpenGraphAudio>(
  items: T[] | undefined
): T[] | undefined => {
  if (!items) {
    return undefined;
  }

  const filtered = items
    .filter((item) => isStrictSocialUrl(item.url))
    .map((item) => ({
      ...item,
      ...(item.secureUrl && isStrictSocialUrl(item.secureUrl)
        ? { secureUrl: item.secureUrl }
        : { secureUrl: undefined }),
    }));

  return filtered.length > 0 ? filtered : undefined;
};

const filterOpenGraph = (og: OpenGraphData): OpenGraphData => {
  const videos = filterOpenGraphMedia(og.videos);
  const audio = filterOpenGraphMedia(og.audio);

  return {
    ...og,
    ...(og.determiner && isValidOgDeterminer(og.determiner)
      ? { determiner: og.determiner }
      : { determiner: undefined }),
    images: filterOpenGraphImages(og.images),
    ...(og.url && isStrictSocialUrl(og.url)
      ? { url: og.url }
      : { url: undefined }),
    ...(videos ? { videos } : { videos: undefined }),
    ...(audio ? { audio } : { audio: undefined }),
  };
};

const filterTwitterPlatform = (
  platform: TwitterAppPlatform | undefined
): TwitterAppPlatform | undefined => {
  if (!platform) {
    return undefined;
  }

  const next: TwitterAppPlatform = {
    ...(platform.id ? { id: platform.id } : {}),
    ...(platform.name ? { name: platform.name } : {}),
    ...(platform.url ? { url: platform.url } : {}),
  };

  return Object.keys(next).length > 0 ? next : undefined;
};

const filterTwitterApp = (
  app: TwitterApp | undefined
): TwitterApp | undefined => {
  if (!app) {
    return undefined;
  }

  const iphone = filterTwitterPlatform(app.iphone);
  const ipad = filterTwitterPlatform(app.ipad);
  const googleplay = filterTwitterPlatform(app.googleplay);

  const next: TwitterApp = {
    ...(iphone ? { iphone } : {}),
    ...(ipad ? { ipad } : {}),
    ...(googleplay ? { googleplay } : {}),
    ...(app.country ? { country: app.country } : {}),
  };

  return Object.keys(next).length > 0 ? next : undefined;
};

// eslint-disable-next-line complexity -- Field-level filtering intentionally mirrors strict social rules.
const filterTwitter = (twitter: TwitterCardData): TwitterCardData => {
  const app = filterTwitterApp(twitter.app);
  const player =
    twitter.player && isStrictSocialUrl(twitter.player.url)
      ? {
          ...twitter.player,
          ...(isPositiveInteger(twitter.player.width)
            ? { width: twitter.player.width }
            : { width: undefined }),
          ...(isPositiveInteger(twitter.player.height)
            ? { height: twitter.player.height }
            : { height: undefined }),
          ...(twitter.player.stream && isStrictSocialUrl(twitter.player.stream)
            ? { stream: twitter.player.stream }
            : { stream: undefined }),
        }
      : undefined;

  return {
    ...(twitter.card && isValidTwitterCard(twitter.card)
      ? { card: twitter.card }
      : {}),
    ...(twitter.site && isValidTwitterHandle(twitter.site)
      ? { site: twitter.site }
      : {}),
    ...(twitter.siteId && isValidNumericId(twitter.siteId)
      ? { siteId: twitter.siteId }
      : {}),
    ...(twitter.creator && isValidTwitterHandle(twitter.creator)
      ? { creator: twitter.creator }
      : {}),
    ...(twitter.creatorId && isValidNumericId(twitter.creatorId)
      ? { creatorId: twitter.creatorId }
      : {}),
    ...(twitter.title ? { title: twitter.title } : {}),
    ...(twitter.description ? { description: twitter.description } : {}),
    ...(twitter.image?.url && isStrictSocialUrl(twitter.image.url)
      ? { image: twitter.image }
      : {}),
    ...(player ? { player } : {}),
    ...(app ? { app } : {}),
  };
};

export const filterSocialMetadata = (
  metadata: Metadata
): Pick<Metadata, "og" | "twitter"> => ({
  og: filterOpenGraph(metadata.og),
  twitter: filterTwitter(metadata.twitter),
});

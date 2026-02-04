import { readFileSync } from "node:fs";
import { join } from "node:path";

const dataDir = import.meta.dir;

const loadFixture = (name: string): string =>
  readFileSync(join(dataDir, name), "utf8");

export const realWorldFixtures = {
  youtubeVideo: loadFixture("rw-youtube-video.html"),
  twitterTweet: loadFixture("rw-twitter-tweet.html"),
  githubRepo: loadFixture("rw-github-repo.html"),
  mediumArticle: loadFixture("rw-medium-article.html"),
  wikipediaPage: loadFixture("rw-wikipedia-page.html"),
  amazonProduct: loadFixture("rw-amazon-product.html"),
  spotifyTrack: loadFixture("rw-spotify-track.html"),
  nytimesArticle: loadFixture("rw-nytimes-article.html"),
  stackoverflowQuestion: loadFixture("rw-stackoverflow-question.html"),
  redditPost: loadFixture("rw-reddit-post.html"),
  linkedinProfile: loadFixture("rw-linkedin-profile.html"),
  imdbMovie: loadFixture("rw-imdb-movie.html"),
  airbnbListing: loadFixture("rw-airbnb-listing.html"),
  pinterestPin: loadFixture("rw-pinterest-pin.html"),
  tiktokVideo: loadFixture("rw-tiktok-video.html"),
} as const;

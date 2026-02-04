import { readFileSync } from "node:fs";
import { join } from "node:path";

const dataDir = import.meta.dir;

const loadFixture = (name: string): string =>
  readFileSync(join(dataDir, name), "utf8");

export const structuredTypeFixtures = {
  bookComplete: loadFixture("book-complete.html"),
  bookIsbnFormats: loadFixture("book-isbn-formats.html"),
  bookMultipleAuthorsTags: loadFixture("book-multiple-authors-tags.html"),
  musicAlbumComplete: loadFixture("music-album-complete.html"),
  musicPlaylist: loadFixture("music-playlist.html"),
  musicRadioStation: loadFixture("music-radio-station.html"),
  musicSongComplete: loadFixture("music-song-complete.html"),
  profileComplete: loadFixture("profile-complete.html"),
  profileGenderEdgeCases: loadFixture("profile-gender-edge-cases.html"),
  videoActorsMixedRoles: loadFixture("video-actors-mixed-roles.html"),
  videoEpisodeSeries: loadFixture("video-episode-series.html"),
  videoMovieComplete: loadFixture("video-movie-complete.html"),
} as const;

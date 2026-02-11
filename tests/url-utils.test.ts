import { describe, expect, it } from "bun:test";

import {
  getBaseUrl,
  isPrivateUrl,
  isSafeUrl,
  isValidUrl,
  normalizeUrl,
  resolveUrl,
} from "../src/utils/url";

describe("url utils - validation", () => {
  it("validates only HTTP(S) URLs", () => {
    expect(isValidUrl("https://example.com")).toBe(true);
    expect(isValidUrl("http://example.com")).toBe(true);
    expect(isValidUrl("ftp://example.com")).toBe(false);
    expect(isValidUrl("/relative/path")).toBe(false);
  });

  it("detects private hostnames and IP ranges", () => {
    expect(isPrivateUrl("http://localhost:3000")).toBe(true);
    expect(isPrivateUrl("http://127.0.0.1/admin")).toBe(true);
    expect(isPrivateUrl("http://10.0.0.8/service")).toBe(true);
    expect(isPrivateUrl("http://192.168.1.2/service")).toBe(true);
    expect(isPrivateUrl("http://[::1]/")).toBe(true);
    expect(isPrivateUrl("http://[fc00::1]/")).toBe(true);
  });

  it("treats public URLs as non-private", () => {
    expect(isPrivateUrl("https://github.com")).toBe(false);
    expect(isPrivateUrl("https://example.org/path")).toBe(false);
  });

  it("reports safe URLs correctly", () => {
    expect(isSafeUrl("https://example.com")).toBe(true);
    expect(isSafeUrl("http://localhost:3000")).toBe(false);
    expect(isSafeUrl("ftp://example.com")).toBe(false);
  });
});

describe("url utils - resolution and normalization", () => {
  it("resolves relative and protocol-relative URLs", () => {
    expect(resolveUrl("/about", "https://example.com/blog")).toBe(
      "https://example.com/about"
    );
    expect(
      resolveUrl("//cdn.example.com/asset.png", "https://example.com")
    ).toBe("https://cdn.example.com/asset.png");
  });

  it("keeps unresolved relative URLs when no base is provided", () => {
    expect(resolveUrl("/about")).toBe("/about");
  });

  it("normalizes protocol/host casing and trailing slash", () => {
    expect(normalizeUrl("HTTPS://EXAMPLE.COM/")).toBe("https://example.com");
    expect(normalizeUrl("https://Example.com/Path/?a=1")).toBe(
      "https://example.com/Path/?a=1"
    );
  });

  it("extracts base URL from full URLs", () => {
    expect(getBaseUrl("https://example.com/path?q=1")).toBe(
      "https://example.com"
    );
    expect(getBaseUrl("http://localhost:3000/docs")).toBe(
      "http://localhost:3000"
    );
  });
});

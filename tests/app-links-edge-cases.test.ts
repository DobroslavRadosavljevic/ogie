import { describe, expect, it } from "bun:test";

import { extractFromHtml, type ExtractSuccess } from "../src";
import { appLinksFixtures } from "./data/app-links";

describe("App Links Edge Cases - All platforms", () => {
  const result = extractFromHtml(appLinksFixtures.alAllPlatforms, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("appLinks is defined", () => {
    expect(result.data.appLinks).toBeDefined();
  });

  it("extracts iOS data", () => {
    expect(result.data.appLinks?.ios).toBeDefined();
    expect(result.data.appLinks?.ios?.[0]?.url).toBe("myapp://page");
    expect(result.data.appLinks?.ios?.[0]?.appStoreId).toBe("123456");
    expect(result.data.appLinks?.ios?.[0]?.appName).toBe("My App iOS");
  });

  it("extracts iPhone data", () => {
    expect(result.data.appLinks?.iphone).toBeDefined();
    expect(result.data.appLinks?.iphone?.[0]?.url).toBe("myapp://iphone/page");
    expect(result.data.appLinks?.iphone?.[0]?.appName).toBe("My App iPhone");
  });

  it("extracts iPad data", () => {
    expect(result.data.appLinks?.ipad).toBeDefined();
    expect(result.data.appLinks?.ipad?.[0]?.url).toBe("myapp://ipad/page");
    expect(result.data.appLinks?.ipad?.[0]?.appName).toBe("My App iPad");
  });

  it("extracts Android data", () => {
    expect(result.data.appLinks?.android).toBeDefined();
    expect(result.data.appLinks?.android?.[0]?.url).toBe(
      "myapp://android/page"
    );
    expect(result.data.appLinks?.android?.[0]?.package).toBe("com.example.app");
    expect(result.data.appLinks?.android?.[0]?.appName).toBe("My App Android");
  });

  it("extracts web data", () => {
    expect(result.data.appLinks?.web).toBeDefined();
    expect(result.data.appLinks?.web?.[0]?.url).toBe(
      "https://example.com/page"
    );
    expect(result.data.appLinks?.web?.[0]?.shouldFallback).toBe(true);
  });
});

describe("App Links Edge Cases - Multiple iOS apps", () => {
  const result = extractFromHtml(appLinksFixtures.alMultipleIosApps, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("extracts multiple iOS entries", () => {
    expect(result.data.appLinks?.ios).toHaveLength(2);
  });

  it("extracts first iOS app", () => {
    expect(result.data.appLinks?.ios?.[0]?.url).toBe("app1://page");
    expect(result.data.appLinks?.ios?.[0]?.appStoreId).toBe("111111");
    expect(result.data.appLinks?.ios?.[0]?.appName).toBe("App One");
  });

  it("extracts second iOS app", () => {
    expect(result.data.appLinks?.ios?.[1]?.url).toBe("app2://page");
    expect(result.data.appLinks?.ios?.[1]?.appStoreId).toBe("222222");
    expect(result.data.appLinks?.ios?.[1]?.appName).toBe("App Two");
  });
});

describe("App Links Edge Cases - Windows Universal", () => {
  const result = extractFromHtml(appLinksFixtures.alWindowsUniversal, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("extracts windowsUniversal platform data", () => {
    expect(result.data.appLinks?.windowsUniversal).toBeDefined();
    expect(result.data.appLinks?.windowsUniversal?.[0]?.url).toBe(
      "myapp://page"
    );
    expect(result.data.appLinks?.windowsUniversal?.[0]?.appId).toBe(
      "AppStoreId.MyApp"
    );
    expect(result.data.appLinks?.windowsUniversal?.[0]?.appName).toBe(
      "My Windows App"
    );
  });

  it("extracts web data alongside windows_universal", () => {
    expect(result.data.appLinks?.web?.[0]?.url).toBe("https://example.com");
  });
});

describe("App Links Edge Cases - Partial data", () => {
  const result = extractFromHtml(appLinksFixtures.alPartialData, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("iOS has url only (no app_store_id or app_name)", () => {
    expect(result.data.appLinks?.ios?.[0]?.url).toBe("myapp://page");
    expect(result.data.appLinks?.ios?.[0]?.appStoreId).toBeUndefined();
    expect(result.data.appLinks?.ios?.[0]?.appName).toBeUndefined();
  });

  it("Android has package only (no url or app_name)", () => {
    expect(result.data.appLinks?.android?.[0]?.package).toBe("com.example.app");
    expect(result.data.appLinks?.android?.[0]?.url).toBeUndefined();
    expect(result.data.appLinks?.android?.[0]?.appName).toBeUndefined();
  });

  it("web has url only", () => {
    expect(result.data.appLinks?.web?.[0]?.url).toBe("https://example.com");
    expect(result.data.appLinks?.web?.[0]?.shouldFallback).toBeUndefined();
  });
});

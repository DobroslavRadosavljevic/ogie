/* eslint-disable jest/no-conditional-in-test, max-statements, no-nested-ternary, promise/avoid-new, require-await */
import { describe, expect, it } from "bun:test";

import { FetchError } from "../src/errors/fetch-error";
import { OgieError } from "../src/errors/ogie-error";
import { fetchUrl } from "../src/fetch";

type FetchInput = Parameters<typeof fetch>[0];

const getThrownError = async (
  operation: () => Promise<unknown>
): Promise<unknown> => {
  try {
    await operation();
    return undefined;
  } catch (error) {
    return error;
  }
};

const getRequestUrl = (input: FetchInput | URL): string =>
  typeof input === "string"
    ? input
    : input instanceof URL
      ? input.href
      : input.url;

describe("fetchUrl", () => {
  it("blocks private URLs by default", async () => {
    const error = await getThrownError(() =>
      fetchUrl("http://127.0.0.1/private")
    );

    expect(error).toBeInstanceOf(OgieError);
    expect((error as OgieError).code).toBe("INVALID_URL");
  });

  it("allows private URLs when allowPrivateUrls is true", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () =>
      new Response("<html><head><title>ok</title></head><body></body></html>", {
        headers: {
          "content-type": "text/html; charset=utf-8",
        },
      })) as unknown as typeof globalThis.fetch;

    try {
      const result = await fetchUrl("http://127.0.0.1/private", {
        allowPrivateUrls: true,
      });

      expect(result.finalUrl).toBe("http://127.0.0.1/private");
      expect(result.html).toContain("<title>ok</title>");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("rejects header injection attempts", async () => {
    const originalFetch = globalThis.fetch;
    let fetchCalls = 0;
    globalThis.fetch = (async () => {
      fetchCalls += 1;
      return new Response("<html></html>", {
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }) as unknown as typeof globalThis.fetch;

    try {
      const error = await getThrownError(() =>
        fetchUrl("https://public.example.com", {
          headers: { "x-bad-header": "line1\r\nline2" },
        })
      );

      expect(fetchCalls).toBe(0);
      expect(error).toBeInstanceOf(FetchError);
      expect((error as FetchError).code).toBe("FETCH_ERROR");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("rejects non-HTML responses", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () =>
      Response.json(
        { ok: true },
        { status: 200 }
      )) as unknown as typeof globalThis.fetch;

    try {
      const error = await getThrownError(() =>
        fetchUrl("https://public.example.com/non-html")
      );

      expect(error).toBeInstanceOf(FetchError);
      expect((error as FetchError).message).toContain("Expected HTML content");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("rejects oversized responses via Content-Length", async () => {
    const originalFetch = globalThis.fetch;
    const oversized = String(10 * 1024 * 1024 + 1);
    globalThis.fetch = (async () =>
      new Response("<html></html>", {
        headers: {
          "content-length": oversized,
          "content-type": "text/html; charset=utf-8",
        },
      })) as unknown as typeof globalThis.fetch;

    try {
      const error = await getThrownError(() =>
        fetchUrl("https://public.example.com/oversized")
      );

      expect(error).toBeInstanceOf(FetchError);
      expect((error as FetchError).message).toContain(
        "exceeds maximum allowed"
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("follows redirects and resolves final URL", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (input: FetchInput) => {
      const url = getRequestUrl(input);
      if (url === "https://public.example.com/start") {
        return new Response(null, {
          headers: { location: "https://public.example.com/final" },
          status: 302,
        });
      }
      if (url === "https://public.example.com/final") {
        return new Response("<html><head><title>final</title></head></html>", {
          headers: { "content-type": "text/html; charset=utf-8" },
        });
      }
      return new Response("Not found", { status: 404 });
    }) as unknown as typeof globalThis.fetch;

    try {
      const result = await fetchUrl("https://public.example.com/start");
      expect(result.finalUrl).toBe("https://public.example.com/final");
      expect(result.html).toContain("<title>final</title>");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("returns REDIRECT_LIMIT for redirect loops", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (input: FetchInput) => {
      const url = getRequestUrl(input);
      if (url === "https://public.example.com/start") {
        return new Response(null, {
          headers: { location: "https://public.example.com/loop-a" },
          status: 302,
        });
      }
      if (url === "https://public.example.com/loop-a") {
        return new Response(null, {
          headers: { location: "https://public.example.com/loop-b" },
          status: 302,
        });
      }
      if (url === "https://public.example.com/loop-b") {
        return new Response(null, {
          headers: { location: "https://public.example.com/loop-a" },
          status: 302,
        });
      }
      return new Response("Not found", { status: 404 });
    }) as unknown as typeof globalThis.fetch;

    try {
      const error = await getThrownError(() =>
        fetchUrl("https://public.example.com/start")
      );

      expect(error).toBeInstanceOf(FetchError);
      expect((error as FetchError).code).toBe("REDIRECT_LIMIT");
      expect((error as FetchError).message).toContain("Redirect loop");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("returns REDIRECT_LIMIT when max redirects is exceeded", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (input: FetchInput) => {
      const url = getRequestUrl(input);
      const match = url.match(/\/step-(\d+)$/);
      const step = match ? Number.parseInt(match[1], 10) : 0;
      const nextStep = step + 1;
      return new Response(null, {
        headers: { location: `https://public.example.com/step-${nextStep}` },
        status: 302,
      });
    }) as unknown as typeof globalThis.fetch;

    try {
      const error = await getThrownError(() =>
        fetchUrl("https://public.example.com/step-0", {
          maxRedirects: 2,
        })
      );

      expect(error).toBeInstanceOf(FetchError);
      expect((error as FetchError).code).toBe("REDIRECT_LIMIT");
      expect((error as FetchError).message).toContain("Maximum redirects (2)");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("returns TIMEOUT when request exceeds timeout", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (
      _input: FetchInput,
      init?: Parameters<typeof fetch>[1]
    ) => {
      const signal = init?.signal;
      return await new Promise<Response>((_resolve, reject) => {
        if (!signal) {
          return;
        }
        signal.addEventListener("abort", () => {
          reject(new DOMException("Aborted", "AbortError"));
        });
      });
    }) as unknown as typeof globalThis.fetch;

    try {
      const error = await getThrownError(() =>
        fetchUrl("https://public.example.com/timeout", {
          timeout: 25,
        })
      );

      expect(error).toBeInstanceOf(FetchError);
      expect((error as FetchError).code).toBe("TIMEOUT");
      expect((error as FetchError).message).toContain("Request timeout");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

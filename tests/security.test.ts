/* eslint-disable jest/no-conditional-in-test, max-statements, no-nested-ternary, require-await, unicorn/consistent-function-scoping */
import { afterEach, beforeEach, describe, expect, it } from "bun:test";

import {
  extract,
  extractFromHtml,
  isOgieError,
  type ExtractFailure,
  type ExtractSuccess,
  type JsonLdPerson,
} from "../src";
import { securityFixtures } from "./data/security";

describe("Security - XSS in og:title", () => {
  const result = extractFromHtml(securityFixtures.xssInOgTitle, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("stores escaped script tag in og:title as-is", () => {
    expect(result.data.og.title).toBe("<script>alert('xss')</script>");
  });

  it("extracts og:description normally", () => {
    expect(result.data.og.description).toBe("Normal description");
  });

  it("extracts og:type normally", () => {
    expect(result.data.og.type).toBe("website");
  });
});

describe("Security - XSS in meta content", () => {
  const result = extractFromHtml(securityFixtures.xssInMetaContent, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("stores img XSS payload in basic.description as-is", () => {
    expect(result.data.basic.description).toBe("<img src=x onerror=alert(1)>");
  });

  it("extracts og:title normally", () => {
    expect(result.data.og.title).toBe("XSS Meta Test");
  });

  it("stores script tag in basic.author as-is", () => {
    expect(result.data.basic.author).toBe("<script>document.cookie</script>");
  });
});

describe("Security - XSS in JSON-LD (with </script> in value)", () => {
  const result = extractFromHtml(securityFixtures.xssInJsonld, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("extracts og:title normally", () => {
    expect(result.data.og.title).toBe("JSON-LD XSS Test");
  });

  it("skips JSON-LD block because </script> in value terminates script element", () => {
    // The </script> inside the JSON value closes the script tag in HTML parsing,
    // making the JSON invalid. This is correct browser behavior.
    expect(result.data.jsonLd).toBeUndefined();
  });
});

describe("Security - XSS in JSON-LD (safe payloads preserved)", () => {
  // Test with XSS payloads that do NOT contain </script> to verify
  // the library stores them as-is without sanitization
  // Use inline HTML with properly escaped script closing tag
  const safeHtml = `<!doctype html>
<html>
  <head>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "name": "<img onerror=alert(1)>",
      "description": "Normal description with XSS attempt",
      "author": {"@type": "Person", "name": "'; DROP TABLE users;--"}
    }
    </script>
    <meta property="og:title" content="JSON-LD XSS Safe Test" />
  </head>
  <body></body>
</html>`;

  const result = extractFromHtml(safeHtml, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("stores img XSS payload in JSON-LD item name as-is", () => {
    expect(result.data.jsonLd).toBeDefined();
    expect(result.data.jsonLd?.items[0].name).toBe("<img onerror=alert(1)>");
  });

  it("preserves SQL injection string in author name as-is", () => {
    const author = result.data.jsonLd?.items[0].author as
      | JsonLdPerson
      | undefined;
    expect(author).toBeDefined();
    expect(author?.name).toBe("'; DROP TABLE users;--");
  });
});

describe("Security - JavaScript URLs", () => {
  const result = extractFromHtml(securityFixtures.xssJavascriptUrls, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("extracts og:title normally", () => {
    expect(result.data.og.title).toBe("JavaScript URL Test");
  });

  it("stores javascript: URL in og:url as-is (no sanitization at parse level)", () => {
    // eslint-disable-next-line no-script-url
    expect(result.data.og.url).toBe("javascript:alert('xss')");
  });

  it("stores javascript: URL in og:image as-is", () => {
    expect(result.data.og.images).toHaveLength(1);
    // eslint-disable-next-line no-script-url -- Testing XSS payloads
    const jsUrl = "javascript:alert(document.domain)";
    expect(result.data.og.images[0].url).toBe(jsUrl);
  });

  it("stores javascript: URL in canonical as-is", () => {
    // eslint-disable-next-line no-script-url
    expect(result.data.basic.canonical).toBe("javascript:void(0)");
  });
});

describe("Security - Data URIs", () => {
  const result = extractFromHtml(securityFixtures.xssDataUri, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("extracts og:title normally", () => {
    expect(result.data.og.title).toBe("Data URI Test");
  });

  it("stores data: URI in og:image as-is", () => {
    expect(result.data.og.images).toHaveLength(1);
    expect(result.data.og.images[0].url).toStartWith("data:");
  });

  it("stores data: URI in favicon as-is", () => {
    expect(result.data.basic.favicon).toBeDefined();
    expect(result.data.basic.favicon).toStartWith("data:");
  });
});

describe("Security - SSRF Private URLs (parse level)", () => {
  const result = extractFromHtml(securityFixtures.ssrfPrivateUrls, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("extracts og:title normally", () => {
    expect(result.data.og.title).toBe("SSRF Test Page");
  });

  it("stores loopback canonical URL as-is at parse level", () => {
    expect(result.data.basic.canonical).toBe("http://127.0.0.1/admin");
  });

  it("stores localhost og:url as-is at parse level", () => {
    expect(result.data.og.url).toBe("http://localhost:3000/secret");
  });

  it("stores private IP og:image as-is at parse level", () => {
    expect(result.data.og.images).toHaveLength(1);
    expect(result.data.og.images[0].url).toBe(
      "http://10.0.0.1/internal-image.jpg"
    );
  });

  it("stores private IP oEmbed URL in discovery", () => {
    expect(result.data.oEmbedDiscovery).toBeDefined();
    expect(result.data.oEmbedDiscovery?.jsonUrl).toBe(
      "http://192.168.1.1/oembed"
    );
  });
});

describe("Security - SSRF protection on network path", () => {
  it("blocks private URLs in extract() by default", async () => {
    const result = (await extract(
      "http://127.0.0.1/internal"
    )) as ExtractFailure;

    expect(result.success).toBe(false);
    expect(result.error.code).toBe("INVALID_URL");
    expect(isOgieError(result.error)).toBe(true);
  });

  it("allows private URLs when allowPrivateUrls is enabled", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async () =>
      new Response(
        `
          <!doctype html>
          <html>
            <head>
              <meta property="og:title" content="Private Page">
            </head>
            <body></body>
          </html>
        `,
        {
          headers: {
            "content-type": "text/html; charset=utf-8",
          },
        }
      )) as unknown as typeof globalThis.fetch;

    try {
      const result = (await extract("http://127.0.0.1/internal", {
        allowPrivateUrls: true,
      })) as ExtractSuccess;

      expect(result.success).toBe(true);
      expect(result.data.og.title).toBe("Private Page");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

describe("Security - oEmbed redirect SSRF hardening", () => {
  let originalFetch: typeof globalThis.fetch;
  let requestedUrls: string[];

  const htmlWithOEmbed = (oEmbedEndpoint: string): string => `
    <!doctype html>
    <html>
      <head>
        <meta property="og:title" content="Public Article">
        <link
          rel="alternate"
          type="application/json+oembed"
          href="${oEmbedEndpoint}"
        >
      </head>
      <body></body>
    </html>
  `;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    requestedUrls = [];
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("blocks oEmbed redirect to private IP by default", async () => {
    globalThis.fetch = (async (input: Parameters<typeof fetch>[0]) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url;
      requestedUrls.push(url);

      if (url === "https://public.example.com/article") {
        return new Response(
          htmlWithOEmbed("https://public.example.com/oembed?format=json"),
          {
            headers: { "content-type": "text/html; charset=utf-8" },
          }
        );
      }
      if (url === "https://public.example.com/oembed?format=json") {
        return new Response(null, {
          headers: { location: "https://127.0.0.1:8080/oembed" },
          status: 302,
        });
      }
      if (url === "https://127.0.0.1:8080/oembed") {
        return Response.json({
          height: 360,
          html: "<iframe></iframe>",
          type: "video",
          version: "1.0",
          width: 640,
        });
      }
      return new Response("Not found", { status: 404 });
    }) as unknown as typeof globalThis.fetch;

    const result = (await extract("https://public.example.com/article", {
      fetchOEmbed: true,
    })) as ExtractSuccess;

    expect(result.success).toBe(true);
    expect(result.data.oEmbed).toBeUndefined();
    expect(requestedUrls).toEqual([
      "https://public.example.com/article",
      "https://public.example.com/oembed?format=json",
    ]);
  });

  it("blocks multi-hop oEmbed redirect chains when an intermediate hop is private", async () => {
    globalThis.fetch = (async (input: Parameters<typeof fetch>[0]) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url;
      requestedUrls.push(url);

      if (url === "https://public.example.com/article") {
        return new Response(
          htmlWithOEmbed("https://public.example.com/oembed?format=json"),
          {
            headers: { "content-type": "text/html; charset=utf-8" },
          }
        );
      }
      if (url === "https://public.example.com/oembed?format=json") {
        return new Response(null, {
          headers: { location: "https://public.example.com/oembed-hop-2" },
          status: 302,
        });
      }
      if (url === "https://public.example.com/oembed-hop-2") {
        return new Response(null, {
          headers: { location: "https://10.0.0.5/oembed-private" },
          status: 302,
        });
      }
      if (url === "https://10.0.0.5/oembed-private") {
        return Response.json({
          title: "Should never be fetched",
          type: "link",
          version: "1.0",
        });
      }
      return new Response("Not found", { status: 404 });
    }) as unknown as typeof globalThis.fetch;

    const result = (await extract("https://public.example.com/article", {
      fetchOEmbed: true,
    })) as ExtractSuccess;

    expect(result.success).toBe(true);
    expect(result.data.oEmbed).toBeUndefined();
    expect(requestedUrls).toEqual([
      "https://public.example.com/article",
      "https://public.example.com/oembed?format=json",
      "https://public.example.com/oembed-hop-2",
    ]);
  });

  it("allows private oEmbed redirects when allowPrivateUrls is true", async () => {
    globalThis.fetch = (async (input: Parameters<typeof fetch>[0]) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.href
            : input.url;
      requestedUrls.push(url);

      if (url === "https://public.example.com/article") {
        return new Response(
          htmlWithOEmbed("https://public.example.com/oembed?format=json"),
          {
            headers: { "content-type": "text/html; charset=utf-8" },
          }
        );
      }
      if (url === "https://public.example.com/oembed?format=json") {
        return new Response(null, {
          headers: { location: "https://127.0.0.1:8080/oembed" },
          status: 302,
        });
      }
      if (url === "https://127.0.0.1:8080/oembed") {
        return Response.json({
          provider_name: "Local Provider",
          title: "Private oEmbed",
          type: "link",
          version: "1.0",
        });
      }
      return new Response("Not found", { status: 404 });
    }) as unknown as typeof globalThis.fetch;

    const result = (await extract("https://public.example.com/article", {
      allowPrivateUrls: true,
      fetchOEmbed: true,
    })) as ExtractSuccess;

    expect(result.success).toBe(true);
    expect(result.data.oEmbed?.type).toBe("link");
    expect(result.data.oEmbed?.title).toBe("Private oEmbed");
    expect(requestedUrls).toEqual([
      "https://public.example.com/article",
      "https://public.example.com/oembed?format=json",
      "https://127.0.0.1:8080/oembed",
    ]);
  });
});

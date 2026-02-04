import { describe, expect, it } from "bun:test";

import {
  extractFromHtml,
  type ExtractSuccess,
  type JsonLdPerson,
} from "../src";
import { jsonldFixtures } from "./data/jsonld";

describe("extractFromHtml - JSON-LD malformed JSON", () => {
  const result = extractFromHtml(jsonldFixtures.malformedJson, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("returns undefined jsonLd when JSON is invalid", () => {
    expect(result.data.jsonLd).toBeUndefined();
  });

  it("still extracts og:title from meta tags", () => {
    expect(result.data.og.title).toBe("Malformed JSON-LD Page");
  });
});

describe("extractFromHtml - JSON-LD empty script tags", () => {
  const result = extractFromHtml(jsonldFixtures.emptyScript, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("returns undefined jsonLd for empty scripts", () => {
    expect(result.data.jsonLd).toBeUndefined();
  });
});

describe("extractFromHtml - JSON-LD multiple blocks", () => {
  const result = extractFromHtml(jsonldFixtures.multipleBlocks, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("extracts all 4 items from separate script blocks", () => {
    expect(result.data.jsonLd).toBeDefined();
    expect(result.data.jsonLd?.items).toHaveLength(4);
  });

  it("includes WebPage type", () => {
    const webPage = result.data.jsonLd?.items.find(
      (item) => item.type === "WebPage"
    );
    expect(webPage).toBeDefined();
    expect(webPage?.name).toBe("Test Page");
  });

  it("includes Organization type", () => {
    const org = result.data.jsonLd?.items.find(
      (item) => item.type === "Organization"
    );
    expect(org).toBeDefined();
    expect(org?.name).toBe("Example Corp");
  });

  it("includes BreadcrumbList type", () => {
    const breadcrumb = result.data.jsonLd?.items.find(
      (item) => item.type === "BreadcrumbList"
    );
    expect(breadcrumb).toBeDefined();
  });

  it("includes Person type", () => {
    const person = result.data.jsonLd?.items.find(
      (item) => item.type === "Person"
    );
    expect(person).toBeDefined();
    expect(person?.name).toBe("John Doe");
  });

  it("stores all 4 raw JSON-LD objects", () => {
    expect(result.data.jsonLd?.raw).toHaveLength(4);
  });
});

describe("extractFromHtml - JSON-LD nested @graph", () => {
  const result = extractFromHtml(jsonldFixtures.nestedGraph, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("extracts all 4 items from @graph", () => {
    expect(result.data.jsonLd).toBeDefined();
    expect(result.data.jsonLd?.items).toHaveLength(4);
  });

  it("includes WebPage with @id reference", () => {
    const webPage = result.data.jsonLd?.items.find(
      (item) => item.type === "WebPage"
    );
    expect(webPage).toBeDefined();
    expect(webPage?.name).toBe("Test Page");
  });

  it("includes WebSite", () => {
    const webSite = result.data.jsonLd?.items.find(
      (item) => item.type === "WebSite"
    );
    expect(webSite).toBeDefined();
    expect(webSite?.name).toBe("Example Website");
    expect(webSite?.url).toBe("https://example.com");
  });

  it("includes Article with resolved author reference", () => {
    const article = result.data.jsonLd?.items.find(
      (item) => item.type === "Article"
    );
    expect(article).toBeDefined();
    expect(article?.name).toBe("Graph Article");
    const author = article?.author as JsonLdPerson | undefined;
    expect(author).toBeDefined();
    expect(author?.name).toBe("Jane Smith");
  });

  it("includes Person", () => {
    const person = result.data.jsonLd?.items.find(
      (item) => item.type === "Person"
    );
    expect(person).toBeDefined();
    expect(person?.name).toBe("Jane Smith");
  });
});

describe("extractFromHtml - JSON-LD circular @id references", () => {
  const result = extractFromHtml(jsonldFixtures.circularRefs, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds without infinite loop", () => {
    expect(result.success).toBe(true);
  });

  it("extracts both items from circular graph", () => {
    expect(result.data.jsonLd).toBeDefined();
    expect(result.data.jsonLd?.items).toHaveLength(2);
  });

  it("extracts Organization", () => {
    const org = result.data.jsonLd?.items.find(
      (item) => item.type === "Organization"
    );
    expect(org).toBeDefined();
    expect(org?.name).toBe("Circular Org");
  });

  it("extracts Person", () => {
    const person = result.data.jsonLd?.items.find(
      (item) => item.type === "Person"
    );
    expect(person).toBeDefined();
    expect(person?.name).toBe("Circular Person");
  });
});

describe("extractFromHtml - JSON-LD array root", () => {
  const result = extractFromHtml(jsonldFixtures.arrayRoot, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("extracts both items from root array", () => {
    expect(result.data.jsonLd).toBeDefined();
    expect(result.data.jsonLd?.items).toHaveLength(2);
  });

  it("both items have type Article", () => {
    expect(result.data.jsonLd?.items).toBeDefined();
    const items = result.data.jsonLd?.items;
    expect(items).toBeDefined();
    expect(items).not.toBeUndefined();
    expect(items).not.toBeNull();
    expect(items?.length).toBeGreaterThan(0);
    // eslint-disable-next-line jest/no-conditional-in-test
    for (const item of items ?? []) {
      expect(item.type).toBe("Article");
    }
  });

  it("extracts names from array items", () => {
    expect(result.data.jsonLd?.items[0].name).toBe("Array Item 1");
    expect(result.data.jsonLd?.items[1].name).toBe("Array Item 2");
  });
});

describe("extractFromHtml - JSON-LD missing @context", () => {
  const result = extractFromHtml(jsonldFixtures.missingContext, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("extracts item even without @context", () => {
    expect(result.data.jsonLd).toBeDefined();
    expect(result.data.jsonLd?.items).toHaveLength(1);
  });

  it("extracts type as Article", () => {
    expect(result.data.jsonLd?.items[0].type).toBe("Article");
  });

  it("extracts name", () => {
    expect(result.data.jsonLd?.items[0].name).toBe("No Context Article");
  });

  it("extracts description", () => {
    expect(result.data.jsonLd?.items[0].description).toBe(
      "This JSON-LD has no @context"
    );
  });
});

describe("extractFromHtml - JSON-LD ImageObject", () => {
  const result = extractFromHtml(jsonldFixtures.imageObject, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("extracts the article item", () => {
    expect(result.data.jsonLd).toBeDefined();
    expect(result.data.jsonLd?.items).toHaveLength(1);
    expect(result.data.jsonLd?.items[0].name).toBe("Image Object Article");
  });

  it("normalizes ImageObject to URL string", () => {
    // The parser extracts the url field from ImageObject
    expect(result.data.jsonLd?.items[0].image).toBe(
      "https://example.com/photo.jpg"
    );
  });

  it("preserves full ImageObject in raw data", () => {
    const raw = result.data.jsonLd?.raw[0] as Record<string, unknown>;
    const image = raw.image as Record<string, unknown>;
    expect(image).toBeDefined();
    expect(image["@type"]).toBe("ImageObject");
    expect(image.url).toBe("https://example.com/photo.jpg");
    expect(image.width).toBe(1200);
    expect(image.height).toBe(630);
    expect(image.caption).toBe("Article header image");
  });
});

describe("extractFromHtml - JSON-LD BreadcrumbList", () => {
  const result = extractFromHtml(jsonldFixtures.breadcrumbList, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("extracts BreadcrumbList type", () => {
    expect(result.data.jsonLd).toBeDefined();
    expect(result.data.jsonLd?.items).toHaveLength(1);
    expect(result.data.jsonLd?.items[0].type).toBe("BreadcrumbList");
  });

  it("has itemListElement as additional property", () => {
    const itemListElement = result.data.jsonLd?.items[0]
      .itemListElement as Record<string, unknown>[];
    expect(Array.isArray(itemListElement)).toBe(true);
    expect(itemListElement).toHaveLength(3);
  });

  it("preserves ListItem details", () => {
    const itemListElement = result.data.jsonLd?.items[0]
      .itemListElement as Record<string, unknown>[];
    expect(itemListElement[0].name).toBe("Home");
    expect(itemListElement[1].name).toBe("Category");
    expect(itemListElement[2].name).toBe("Article");
  });
});

describe("extractFromHtml - JSON-LD FAQPage", () => {
  const result = extractFromHtml(jsonldFixtures.faqPage, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("extracts FAQPage type", () => {
    expect(result.data.jsonLd).toBeDefined();
    expect(result.data.jsonLd?.items).toHaveLength(1);
    expect(result.data.jsonLd?.items[0].type).toBe("FAQPage");
  });

  it("extracts name", () => {
    expect(result.data.jsonLd?.items[0].name).toBe(
      "Frequently Asked Questions"
    );
  });

  it("has mainEntity array with questions", () => {
    const mainEntity = result.data.jsonLd?.items[0].mainEntity as Record<
      string,
      unknown
    >[];
    expect(Array.isArray(mainEntity)).toBe(true);
    expect(mainEntity).toHaveLength(2);
  });

  it("preserves question details", () => {
    const mainEntity = result.data.jsonLd?.items[0].mainEntity as Record<
      string,
      unknown
    >[];
    expect(mainEntity[0]["@type"]).toBe("Question");
    expect(mainEntity[0].name).toBe("What is ogie?");
    expect(mainEntity[1].name).toBe("How to install?");
  });
});

describe("extractFromHtml - JSON-LD Product", () => {
  const result = extractFromHtml(jsonldFixtures.product, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("extracts Product item", () => {
    expect(result.data.jsonLd).toBeDefined();
    expect(result.data.jsonLd?.items).toHaveLength(1);
    expect(result.data.jsonLd?.items[0].type).toBe("Product");
    expect(result.data.jsonLd?.items[0].name).toBe("Test Product");
  });

  it("extracts description and image", () => {
    expect(result.data.jsonLd?.items[0].description).toBe("A test product");
    expect(result.data.jsonLd?.items[0].image).toBe(
      "https://example.com/product.jpg"
    );
  });

  it("has offers as additional property", () => {
    const offers = result.data.jsonLd?.items[0].offers as Record<
      string,
      unknown
    >;
    expect(offers).toBeDefined();
    expect(offers["@type"]).toBe("Offer");
    expect(offers.price).toBe("29.99");
    expect(offers.priceCurrency).toBe("USD");
  });

  it("has aggregateRating as additional property", () => {
    const rating = result.data.jsonLd?.items[0].aggregateRating as Record<
      string,
      unknown
    >;
    expect(rating).toBeDefined();
    expect(rating["@type"]).toBe("AggregateRating");
    expect(rating.ratingValue).toBe("4.5");
    expect(rating.reviewCount).toBe("100");
  });
});

describe("extractFromHtml - JSON-LD Recipe", () => {
  const result = extractFromHtml(jsonldFixtures.recipe, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("extracts Recipe item", () => {
    expect(result.data.jsonLd).toBeDefined();
    expect(result.data.jsonLd?.items).toHaveLength(1);
    expect(result.data.jsonLd?.items[0].type).toBe("Recipe");
    expect(result.data.jsonLd?.items[0].name).toBe("Chocolate Chip Cookies");
  });

  it("extracts description and dates", () => {
    expect(result.data.jsonLd?.items[0].description).toBe(
      "Classic chocolate chip cookies recipe"
    );
    expect(result.data.jsonLd?.items[0].datePublished).toBe("2024-01-15");
  });

  it("extracts image", () => {
    expect(result.data.jsonLd?.items[0].image).toBe(
      "https://example.com/cookies.jpg"
    );
  });

  it("extracts author", () => {
    const author = result.data.jsonLd?.items[0].author as
      | JsonLdPerson
      | undefined;
    expect(author).toBeDefined();
    expect(author?.type).toBe("Person");
    expect(author?.name).toBe("Chef Example");
  });

  it("has recipeIngredient array as additional property", () => {
    const ingredients = result.data.jsonLd?.items[0]
      .recipeIngredient as string[];
    expect(Array.isArray(ingredients)).toBe(true);
    expect(ingredients).toHaveLength(3);
    expect(ingredients[0]).toBe("2 cups flour");
  });

  it("has recipeInstructions as additional property", () => {
    const instructions = result.data.jsonLd?.items[0]
      .recipeInstructions as Record<string, unknown>[];
    expect(Array.isArray(instructions)).toBe(true);
    expect(instructions).toHaveLength(3);
    expect(instructions[0]["@type"]).toBe("HowToStep");
  });

  it("has nutrition as additional property", () => {
    const nutrition = result.data.jsonLd?.items[0].nutrition as Record<
      string,
      unknown
    >;
    expect(nutrition).toBeDefined();
    expect(nutrition["@type"]).toBe("NutritionInformation");
    expect(nutrition.calories).toBe("200 calories");
  });
});

describe("extractFromHtml - JSON-LD Event", () => {
  const result = extractFromHtml(jsonldFixtures.event, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("extracts Event item", () => {
    expect(result.data.jsonLd).toBeDefined();
    expect(result.data.jsonLd?.items).toHaveLength(1);
    expect(result.data.jsonLd?.items[0].type).toBe("Event");
    expect(result.data.jsonLd?.items[0].name).toBe("Tech Conference 2024");
  });

  it("has location as additional property", () => {
    const location = result.data.jsonLd?.items[0].location as Record<
      string,
      unknown
    >;
    expect(location).toBeDefined();
    expect(location["@type"]).toBe("Place");
    expect(location.name).toBe("Convention Center");
  });

  it("has location address details", () => {
    const location = result.data.jsonLd?.items[0].location as Record<
      string,
      unknown
    >;
    const address = location.address as Record<string, unknown>;
    expect(address).toBeDefined();
    expect(address["@type"]).toBe("PostalAddress");
    expect(address.addressLocality).toBe("San Francisco");
  });

  it("has performer as additional property", () => {
    const performer = result.data.jsonLd?.items[0].performer as Record<
      string,
      unknown
    >;
    expect(performer).toBeDefined();
    expect(performer["@type"]).toBe("Person");
    expect(performer.name).toBe("Keynote Speaker");
  });

  it("has startDate and endDate as additional properties", () => {
    expect(result.data.jsonLd?.items[0].startDate).toBe(
      "2024-06-15T09:00:00-07:00"
    );
    expect(result.data.jsonLd?.items[0].endDate).toBe(
      "2024-06-17T18:00:00-07:00"
    );
  });

  it("has offers as additional property", () => {
    const offers = result.data.jsonLd?.items[0].offers as Record<
      string,
      unknown
    >;
    expect(offers).toBeDefined();
    expect(offers.price).toBe("299");
    expect(offers.priceCurrency).toBe("USD");
  });
});

describe("extractFromHtml - JSON-LD LocalBusiness", () => {
  const result = extractFromHtml(jsonldFixtures.localBusiness, {
    baseUrl: "https://example.com",
  }) as ExtractSuccess;

  it("succeeds", () => {
    expect(result.success).toBe(true);
  });

  it("extracts LocalBusiness item", () => {
    expect(result.data.jsonLd).toBeDefined();
    expect(result.data.jsonLd?.items).toHaveLength(1);
    expect(result.data.jsonLd?.items[0].type).toBe("LocalBusiness");
    expect(result.data.jsonLd?.items[0].name).toBe("Example Coffee Shop");
  });

  it("extracts image and url", () => {
    expect(result.data.jsonLd?.items[0].image).toBe(
      "https://example.com/shop.jpg"
    );
    expect(result.data.jsonLd?.items[0].url).toBe("https://example.com");
  });

  it("has address as additional property", () => {
    const address = result.data.jsonLd?.items[0].address as Record<
      string,
      unknown
    >;
    expect(address).toBeDefined();
    expect(address["@type"]).toBe("PostalAddress");
    expect(address.streetAddress).toBe("456 Oak Ave");
    expect(address.addressLocality).toBe("Portland");
    expect(address.addressRegion).toBe("OR");
    expect(address.postalCode).toBe("97201");
  });

  it("has geo as additional property", () => {
    const geo = result.data.jsonLd?.items[0].geo as Record<string, unknown>;
    expect(geo).toBeDefined();
    expect(geo["@type"]).toBe("GeoCoordinates");
    expect(geo.latitude).toBe(45.5231);
    expect(geo.longitude).toBe(-122.6765);
  });

  it("has telephone as additional property", () => {
    expect(result.data.jsonLd?.items[0].telephone).toBe("+1-555-123-4567");
  });

  it("has openingHoursSpecification as additional property", () => {
    const hours = result.data.jsonLd?.items[0]
      .openingHoursSpecification as Record<string, unknown>[];
    expect(Array.isArray(hours)).toBe(true);
    expect(hours).toHaveLength(1);
    expect(hours[0].opens).toBe("07:00");
    expect(hours[0].closes).toBe("19:00");
  });
});

import { describe, expect, it } from "vitest";
import type { Restaurant } from "../types/restaurant";
import {
  availableHomeTags,
  buildGoogleMapsUrl,
  filterRestaurants,
  formatCheckedAt,
  getAirportSummaries,
  getAreaSummaries,
  sortByAddedAtDesc,
  sortByNoAsc,
  tagLabel,
} from "./restaurants";

function makeRestaurant(overrides: Partial<Restaurant>): Restaurant {
  return {
    id: "1",
    name: "テスト店",
    airport: "羽田",
    area: "蒲田",
    access: null,
    genre: "洋食",
    specialty: null,
    crewSummary: [],
    hours: null,
    closedDays: null,
    features: {
      breakfast: null,
      lateNight: null,
      solo: null,
      walkable: null,
      takeout: null,
      cashless: null,
      quick: null,
      drink: false,
    },
    tags: [],
    statusNote: null,
    checkedAt: null,
    addedAt: null,
    mapQuery: "テスト店 蒲田 羽田",
    ...overrides,
  };
}

describe("filterRestaurants", () => {
  const list = [
    makeRestaurant({ id: "1", airport: "羽田", area: "蒲田", tags: ["drink"] }),
    makeRestaurant({ id: "2", airport: "羽田", area: "下丸子", tags: ["solo"] }),
    makeRestaurant({ id: "3", airport: "成田", area: "成田駅圏", tags: ["drink", "solo"] }),
  ];

  it("filters by airport and area", () => {
    const result = filterRestaurants(list, { airport: "羽田", area: "蒲田" });
    expect(result.map((r) => r.id)).toEqual(["1"]);
  });

  it("filters by tags (AND condition)", () => {
    const result = filterRestaurants(list, { tags: ["drink", "solo"] });
    expect(result.map((r) => r.id)).toEqual(["3"]);
  });

  it("returns all when no filter given", () => {
    expect(filterRestaurants(list, {})).toHaveLength(3);
  });
});

describe("sorting", () => {
  it("sortByNoAsc orders by numeric id", () => {
    const list = [makeRestaurant({ id: "10" }), makeRestaurant({ id: "2" })];
    expect(sortByNoAsc(list).map((r) => r.id)).toEqual(["2", "10"]);
  });

  it("sortByAddedAtDesc orders newest first, null-safe", () => {
    const list = [
      makeRestaurant({ id: "a", addedAt: "2026-07-01" }),
      makeRestaurant({ id: "b", addedAt: "2026-07-10" }),
      makeRestaurant({ id: "c", addedAt: null }),
    ];
    expect(sortByAddedAtDesc(list).map((r) => r.id)).toEqual(["b", "a", "c"]);
  });
});

describe("availableHomeTags", () => {
  it("hides zero-count tags", () => {
    const list = [makeRestaurant({ tags: ["drink"] })];
    const tags = availableHomeTags(list);
    expect(tags.map((t) => t.key)).toEqual(["drink"]);
  });

  it("returns empty array when nothing matches", () => {
    const list = [makeRestaurant({ tags: [] })];
    expect(availableHomeTags(list)).toEqual([]);
  });
});

describe("area/airport summaries", () => {
  const list = [
    makeRestaurant({ id: "1", airport: "羽田", area: "蒲田" }),
    makeRestaurant({ id: "2", airport: "羽田", area: "蒲田" }),
    makeRestaurant({ id: "3", airport: "羽田", area: "下丸子" }),
    makeRestaurant({ id: "4", airport: "成田", area: "成田駅圏" }),
  ];

  it("aggregates area counts", () => {
    const summaries = getAreaSummaries(list);
    const kamata = summaries.find((s) => s.area === "蒲田");
    expect(kamata?.count).toBe(2);
  });

  it("aggregates airport totals from areas", () => {
    const summaries = getAirportSummaries(list);
    const haneda = summaries.find((s) => s.airport === "羽田");
    expect(haneda?.count).toBe(3);
    expect(haneda?.areas).toHaveLength(2);
  });
});

describe("formatCheckedAt", () => {
  it("formats ISO date into Japanese wording", () => {
    expect(formatCheckedAt("2026-07-09")).toBe("2026年7月9日");
  });

  it("returns null for null input", () => {
    expect(formatCheckedAt(null)).toBeNull();
  });
});

describe("buildGoogleMapsUrl", () => {
  it("encodes the map query", () => {
    const url = buildGoogleMapsUrl("你好（ニーハオ）本店 蒲田 羽田");
    expect(url.startsWith("https://www.google.com/maps/search/?api=1&query=")).toBe(true);
    expect(url).toContain(encodeURIComponent("你好（ニーハオ）本店 蒲田 羽田"));
  });
});

describe("tagLabel", () => {
  it("maps known tag keys to Japanese labels", () => {
    expect(tagLabel("drink")).toBe("飲み");
    expect(tagLabel("earlyMorning")).toBe("朝5時台OK");
  });
});

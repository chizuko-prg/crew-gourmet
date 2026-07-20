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

  it("orders airports geographically and places unknown airports last", () => {
    const mixed = [
      makeRestaurant({ id: "1", airport: "福岡", area: "博多駅前" }),
      makeRestaurant({ id: "2", airport: "将来空港A", area: "将来エリアA" }),
      makeRestaurant({ id: "3", airport: "羽田", area: "蒲田" }),
      makeRestaurant({ id: "4", airport: "新千歳", area: "千歳駅圏" }),
      makeRestaurant({ id: "5", airport: "那覇", area: "旭橋駅圏（西）" }),
      makeRestaurant({ id: "6", airport: "山口宇部", area: "宇部市（松島町）" }),
      makeRestaurant({ id: "7", airport: "秋田", area: "秋田市民市場内" }),
      makeRestaurant({ id: "8", airport: "成田", area: "成田駅圏" }),
      makeRestaurant({ id: "9", airport: "鳥取", area: "鳥取駅圏" }),
      makeRestaurant({ id: "10", airport: "伊丹", area: "蛍池" }),
      makeRestaurant({ id: "11", airport: "将来空港B", area: "将来エリアB" }),
    ];

    expect(getAirportSummaries(mixed).map((summary) => summary.airport)).toEqual([
      "新千歳",
      "秋田",
      "羽田",
      "成田",
      "伊丹",
      "鳥取",
      "山口宇部",
      "福岡",
      "那覇",
      "将来空港A",
      "将来空港B",
    ]);
  });

  it("orders known areas naturally and places unknown areas last", () => {
    const mixed = [
      makeRestaurant({ id: "1", airport: "新千歳", area: "千歳駅圏（東雲町）" }),
      makeRestaurant({ id: "2", airport: "新千歳", area: "将来エリア" }),
      makeRestaurant({ id: "3", airport: "新千歳", area: "千歳駅圏" }),
      makeRestaurant({ id: "4", airport: "新千歳", area: "空港ターミナル内" }),
      makeRestaurant({ id: "5", airport: "新千歳", area: "千歳駅圏（幸町）" }),
    ];

    const [newChitose] = getAirportSummaries(mixed);
    expect(newChitose.areas.map((summary) => summary.area)).toEqual([
      "空港ターミナル内",
      "千歳駅圏",
      "千歳駅圏（幸町）",
      "千歳駅圏（東雲町）",
      "将来エリア",
    ]);
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

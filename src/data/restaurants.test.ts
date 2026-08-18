import { describe, expect, it } from "vitest";
import rawRestaurants from "./restaurants.json";
import type { Restaurant } from "../types/restaurant";

const restaurants = rawRestaurants as unknown as Restaurant[];

describe("published restaurant data", () => {
  it("has unique ids and unique restaurant/location combinations", () => {
    const ids = restaurants.map((restaurant) => restaurant.id);
    const locationKeys = restaurants.map(
      (restaurant) => `${restaurant.name}__${restaurant.airport}__${restaurant.area}`,
    );

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(locationKeys).size).toBe(locationKeys.length);
  });

  it("contains the approved additions once and keeps the existing duplicate out", () => {
    const expectedNames = [
      "カフェ カンナ",
      "味の正福",
      "博多蒸氣屋 中洲店",
      "博多もつ鍋 やま中 赤坂店",
      "謝朋殿 成田空港第2ターミナル店",
      "博多 一天門 成田空港第3ターミナル店",
      "リンガーハット 成田空港第3ターミナル店",
    ];

    for (const name of expectedNames) {
      expect(restaurants.filter((restaurant) => restaurant.name === name)).toHaveLength(1);
    }
  });

  it("uses the current total of 51 published restaurants", () => {
    expect(restaurants).toHaveLength(51);
  });
});

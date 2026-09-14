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
      "五島手延うどん おっどん亭",
      "レストラン カウベル",
      "喫茶ケルン",
      "エアポートグリル＆バール",
      "唐朝刀削麺 成田空港店",
      "串かつ 千里",
      "SOUL STORE",
      "ブーランジュリー フール",
      "食酒房 助",
      "Song Heng",
      "空港ラーメン 天鳳",
      "手打うどん 寺屋",
      "三笠 松山店",
      "沖縄料理あさひ",
      "おにぎりこんが 羽田空港第1ターミナル店",
      "おにぎりこんが 羽田空港第2ターミナル店",
      "おにぎりこんが 羽田空港第3ターミナル店",
      "中国料理 m'S style",
      "三芳家",
      "下田康生堂ぱん茶屋",
      "農家の野菜×創作料理101",
      "酔イ良イ 蒲田総本家",
      "煮込 蔦八",
      "くずし割烹 キンサク",
    ];

    for (const name of expectedNames) {
      expect(restaurants.filter((restaurant) => restaurant.name === name)).toHaveLength(1);
    }
  });

  it("uses the current total of 75 published restaurants", () => {
    expect(restaurants).toHaveLength(75);
  });

  it("keeps countryCode for overseas restaurants only", () => {
    const withCountry = restaurants.filter((restaurant) => restaurant.countryCode);
    expect(withCountry.map((restaurant) => [restaurant.name, restaurant.countryCode])).toEqual([
      ["Song Heng", "FR"],
    ]);
  });
});

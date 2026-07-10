export type TriState = true | false | null;

export interface RestaurantFeatures {
  breakfast: TriState;
  lateNight: TriState;
  solo: TriState;
  walkable: TriState;
  takeout: TriState;
  cashless: TriState;
  quick: TriState;
  drink: boolean;
}

/**
 * earlyMorning（🍳）は「朝5時台でも利用しやすい」の厳格タグ。
 * 現状データは0件のため画面には出さないが、将来の該当店舗追加に備えて保持する。
 */
export type TagKey =
  | "breakfast"
  | "earlyMorning"
  | "lateNight"
  | "solo"
  | "walkable"
  | "cashless"
  | "quick"
  | "takeout"
  | "drink";

export interface Restaurant {
  id: string;
  name: string;
  airport: string;
  area: string;
  access: string | null;
  genre: string;
  specialty: string | null;
  crewSummary: string[];
  hours: string | null;
  closedDays: string | null;
  features: RestaurantFeatures;
  tags: TagKey[];
  /** 公開用に整えた注意文のみ。内部ステータスの生値は含まない。 */
  statusNote: string | null;
  checkedAt: string | null;
  addedAt: string | null;
  mapQuery: string;
}

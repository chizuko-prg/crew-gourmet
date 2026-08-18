import type { Restaurant, TagKey } from "../types/restaurant";

export interface TagDefinition {
  key: TagKey;
  label: string;
}

/**
 * ホーム・一覧の「目的から探す」に出す候補（指示書7章の初期候補8種＋earlyMorning）。
 * earlyMorning（🍳・朝5時台の厳格タグ）は2026-07-19の初該当店舗（No.47）追加に伴い有効化。
 * availableHomeTagsが件数0のタグを隠すため、該当店舗が消えれば自動的に非表示へ戻る。
 */
export const HOME_TAG_DEFINITIONS: TagDefinition[] = [
  { key: "drink", label: "飲み" },
  { key: "breakfast", label: "朝食" },
  { key: "earlyMorning", label: "朝5時台OK" },
  { key: "lateNight", label: "深夜営業" },
  { key: "solo", label: "一人向き" },
  { key: "walkable", label: "徒歩圏" },
  { key: "cashless", label: "キャッシュレス" },
  { key: "quick", label: "提供早め" },
  { key: "takeout", label: "テイクアウト" },
];

/** カード・詳細でタグバッジとして表示する際のラベル定義（全種類）。 */
export const ALL_TAG_DEFINITIONS: TagDefinition[] = [...HOME_TAG_DEFINITIONS];

const TAG_LABEL_MAP = new Map(ALL_TAG_DEFINITIONS.map((t) => [t.key, t.label]));

export function tagLabel(key: TagKey): string {
  return TAG_LABEL_MAP.get(key) ?? key;
}

export function countByTag(list: Restaurant[]): Partial<Record<TagKey, number>> {
  const counts: Partial<Record<TagKey, number>> = {};
  for (const restaurant of list) {
    for (const tag of restaurant.tags) {
      counts[tag] = (counts[tag] ?? 0) + 1;
    }
  }
  return counts;
}

export function availableHomeTags(
  list: Restaurant[],
): (TagDefinition & { count: number })[] {
  const counts = countByTag(list);
  return HOME_TAG_DEFINITIONS.map((def) => ({ ...def, count: counts[def.key] ?? 0 })).filter(
    (def) => def.count > 0,
  );
}

export interface AreaSummary {
  airport: string;
  area: string;
  count: number;
}

export interface AirportSummary {
  airport: string;
  count: number;
  areas: AreaSummary[];
}

/**
 * エリア一覧の空港表示順。
 * 北海道 → 東北 → 関東 → 中部 → 近畿 → 中国 → 四国 → 九州 → 沖縄
 * の地理順で、現在登録されている空港だけを並べる。
 * 未登録の空港は sortByConfiguredNames で末尾へ送られる。
 */
const AIRPORT_DISPLAY_ORDER = [
  // 北海道
  "新千歳",
  // 東北
  "秋田",
  // 関東
  "羽田",
  "成田",
  // 中部（現在は登録なし）
  // 近畿
  "伊丹",
  // 中国
  "鳥取",
  "山口宇部",
  // 四国（現在は登録なし）
  // 九州
  "福岡",
  "長崎",
  "五島福江",
  "宮崎",
  // 沖縄
  "那覇",
  "宮古",
] as const;

/** 各空港内の表示順。未登録のエリアは既知エリアの後ろに追加される。 */
const AREA_DISPLAY_ORDER_BY_AIRPORT: Readonly<Record<string, readonly string[]>> = {
  新千歳: [
    "空港ターミナル内",
    "千歳駅圏",
    "千歳駅圏（幸町）",
    "千歳駅圏（東雲町）",
  ],
  秋田: ["秋田市民市場内"],
  羽田: ["蒲田", "下丸子"],
  成田: ["空港ターミナル内", "成田駅圏"],
  伊丹: ["蛍池"],
  鳥取: ["鳥取駅圏"],
  山口宇部: ["宇部市（松島町）"],
  福岡: [
    "空港ターミナル内",
    "博多駅前",
    "祇園（博多駅圏）",
    "千代（博多駅圏）",
    "住吉（博多駅圏）",
    "赤坂",
  ],
  長崎: ["島原市（島原）"],
  五島福江: ["福江島（福江港周辺）", "福江島（五島コンカナ王国）"],
  宮崎: ["空港ターミナル内"],
  那覇: [
    "旭橋駅圏（西）",
    "県庁前・旭橋駅圏（泉崎）",
    "久茂地・県庁前駅圏",
  ],
  宮古: ["宮古島・平良"],
};

function sortByConfiguredNames<T>(
  items: T[],
  configuredNames: readonly string[],
  getName: (item: T) => string,
): T[] {
  const order = new Map(configuredNames.map((name, index) => [name, index]));
  return items
    .map((item, originalIndex) => ({ item, originalIndex }))
    .sort((a, b) => {
      const aOrder = order.get(getName(a.item)) ?? Number.MAX_SAFE_INTEGER;
      const bOrder = order.get(getName(b.item)) ?? Number.MAX_SAFE_INTEGER;
      return aOrder - bOrder || a.originalIndex - b.originalIndex;
    })
    .map(({ item }) => item);
}

export function getAreaSummaries(list: Restaurant[]): AreaSummary[] {
  const map = new Map<string, AreaSummary>();
  for (const restaurant of list) {
    const key = `${restaurant.airport}__${restaurant.area}`;
    const existing = map.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(key, { airport: restaurant.airport, area: restaurant.area, count: 1 });
    }
  }
  return Array.from(map.values());
}

export function getAirportSummaries(list: Restaurant[]): AirportSummary[] {
  const areaSummaries = getAreaSummaries(list);
  const map = new Map<string, AirportSummary>();
  for (const area of areaSummaries) {
    const existing = map.get(area.airport);
    if (existing) {
      existing.count += area.count;
      existing.areas.push(area);
    } else {
      map.set(area.airport, { airport: area.airport, count: area.count, areas: [area] });
    }
  }
  const airports = Array.from(map.values()).map((airport) => ({
    ...airport,
    areas: sortByConfiguredNames(
      airport.areas,
      AREA_DISPLAY_ORDER_BY_AIRPORT[airport.airport] ?? [],
      (area) => area.area,
    ),
  }));
  return sortByConfiguredNames(airports, AIRPORT_DISPLAY_ORDER, (airport) => airport.airport);
}

export interface RestaurantFilter {
  airport?: string | null;
  area?: string | null;
  tags?: TagKey[];
}

export function filterRestaurants(
  list: Restaurant[],
  filter: RestaurantFilter,
): Restaurant[] {
  return list.filter((restaurant) => {
    if (filter.airport && restaurant.airport !== filter.airport) return false;
    if (filter.area && restaurant.area !== filter.area) return false;
    if (filter.tags && filter.tags.length > 0) {
      if (!filter.tags.every((tag) => restaurant.tags.includes(tag))) return false;
    }
    return true;
  });
}

export function sortByNoAsc(list: Restaurant[]): Restaurant[] {
  return [...list].sort((a, b) => Number(a.id) - Number(b.id));
}

export function sortByAddedAtDesc(list: Restaurant[]): Restaurant[] {
  return [...list].sort((a, b) => (b.addedAt ?? "").localeCompare(a.addedAt ?? ""));
}

export function getRestaurantById(
  list: Restaurant[],
  id: string,
): Restaurant | undefined {
  return list.find((restaurant) => restaurant.id === id);
}

export function formatCheckedAt(value: string | null): string | null {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return value;
  const [, year, month, day] = match;
  return `${year}年${Number(month)}月${Number(day)}日`;
}

export function buildGoogleMapsUrl(mapQuery: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;
}

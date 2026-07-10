import type { Restaurant, TagKey } from "../types/restaurant";

export interface TagDefinition {
  key: TagKey;
  label: string;
}

/**
 * ホーム・一覧の「目的から探す」に出す候補（指示書7章の初期候補8種）。
 * earlyMorning（🍳・朝5時台の厳格タグ）は該当店舗が出てくるまでここに含めない。
 */
export const HOME_TAG_DEFINITIONS: TagDefinition[] = [
  { key: "drink", label: "飲み" },
  { key: "breakfast", label: "朝食" },
  { key: "lateNight", label: "深夜営業" },
  { key: "solo", label: "一人向き" },
  { key: "walkable", label: "徒歩圏" },
  { key: "cashless", label: "キャッシュレス" },
  { key: "quick", label: "提供早め" },
  { key: "takeout", label: "テイクアウト" },
];

/** カード・詳細でタグバッジとして表示する際のラベル定義（全種類）。 */
export const ALL_TAG_DEFINITIONS: TagDefinition[] = [
  ...HOME_TAG_DEFINITIONS,
  { key: "earlyMorning", label: "朝5時台OK" },
];

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
  return Array.from(map.values());
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

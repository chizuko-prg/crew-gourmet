import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useRestaurants } from "../lib/restaurantData";
import { useFavorites } from "../hooks/useFavorites";
import {
  ALL_TAG_DEFINITIONS,
  filterRestaurants,
  sortByNoAsc,
  countByTag,
} from "../lib/restaurants";
import type { TagKey } from "../types/restaurant";
import { AppHeader } from "../components/AppHeader";
import { FilterChip } from "../components/FilterChip";
import { RestaurantCard } from "../components/RestaurantCard";
import { EmptyState } from "../components/EmptyState";
import "./Restaurants.css";

const CANONICAL_TAG_KEYS: TagKey[] = [
  "drink",
  "breakfast",
  "lateNight",
  "solo",
  "walkable",
  "cashless",
  "quick",
  "takeout",
];

function parseTags(value: string | null): TagKey[] {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter((v): v is TagKey => CANONICAL_TAG_KEYS.includes(v as TagKey));
}

export function Restaurants() {
  const restaurants = useRestaurants();
  const [searchParams, setSearchParams] = useSearchParams();
  const validIds = useMemo(() => new Set(restaurants.map((r) => r.id)), [restaurants]);
  const { isFavorite, toggle } = useFavorites(validIds);

  const airport = searchParams.get("airport");
  const area = searchParams.get("area");
  const selectedTags = parseTags(searchParams.get("tags"));

  const scopedByLocation = useMemo(
    () => filterRestaurants(restaurants, { airport, area }),
    [restaurants, airport, area],
  );

  const filtered = useMemo(
    () => sortByNoAsc(filterRestaurants(scopedByLocation, { tags: selectedTags })),
    [scopedByLocation, selectedTags],
  );

  const tagCounts = useMemo(() => countByTag(scopedByLocation), [scopedByLocation]);
  const chipDefinitions = ALL_TAG_DEFINITIONS.filter(
    (def) => CANONICAL_TAG_KEYS.includes(def.key) && (tagCounts[def.key] ?? 0) > 0,
  );

  const toggleTag = (tag: TagKey) => {
    const next = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    const params = new URLSearchParams(searchParams);
    if (next.length > 0) {
      params.set("tags", next.join(","));
    } else {
      params.delete("tags");
    }
    setSearchParams(params, { replace: true });
  };

  const clearTags = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("tags");
    setSearchParams(params, { replace: true });
  };

  const title = area ? `${airport}・${area}` : airport ? airport : "お店を探す";

  return (
    <div>
      <AppHeader
        title={title}
        subtitle={`${filtered.length}件のお店`}
        showBack
      />

      {chipDefinitions.length > 0 ? (
        <div className="restaurants-filter-row">
          <div className="chip-row">
            {chipDefinitions.map((def) => (
              <FilterChip
                key={def.key}
                label={def.label}
                selected={selectedTags.includes(def.key)}
                onClick={() => toggleTag(def.key)}
              />
            ))}
          </div>
          {selectedTags.length > 0 ? (
            <button type="button" className="restaurants-clear" onClick={clearTags}>
              クリア
            </button>
          ) : null}
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <EmptyState message="条件に合うお店はまだありません。条件を減らしてみてください。" />
      ) : (
        filtered.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            isFavorite={isFavorite(restaurant.id)}
            onToggleFavorite={() => toggle(restaurant.id)}
          />
        ))
      )}
    </div>
  );
}

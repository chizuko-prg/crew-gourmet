import { useMemo } from "react";
import { useRestaurants } from "../lib/restaurantData";
import { useFavorites } from "../hooks/useFavorites";
import { getAreaSummaries, sortByNoAsc } from "../lib/restaurants";
import { AppHeader } from "../components/AppHeader";
import { AreaGroup } from "../components/AreaGroup";
import { RestaurantCard } from "../components/RestaurantCard";
import { EmptyState } from "../components/EmptyState";

export function Favorites() {
  const restaurants = useRestaurants();
  const validIds = useMemo(() => new Set(restaurants.map((r) => r.id)), [restaurants]);
  const { ids, isFavorite, toggle } = useFavorites(validIds);

  const favoriteRestaurants = useMemo(
    () => sortByNoAsc(restaurants.filter((r) => ids.includes(r.id))),
    [restaurants, ids],
  );

  const areaSummaries = useMemo(
    () => getAreaSummaries(favoriteRestaurants),
    [favoriteRestaurants],
  );

  return (
    <div>
      <AppHeader title="お気に入り" subtitle={`${favoriteRestaurants.length}件`} />

      {favoriteRestaurants.length === 0 ? (
        <EmptyState message="気になるお店の♡を押すと、ここにまとまります。" />
      ) : (
        areaSummaries.map((summary) => (
          <AreaGroup
            key={`${summary.airport}__${summary.area}`}
            title={`${summary.airport}・${summary.area}`}
            count={summary.count}
          >
            {favoriteRestaurants
              .filter((r) => r.airport === summary.airport && r.area === summary.area)
              .map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  isFavorite={isFavorite(restaurant.id)}
                  onToggleFavorite={() => toggle(restaurant.id)}
                />
              ))}
          </AreaGroup>
        ))
      )}
    </div>
  );
}

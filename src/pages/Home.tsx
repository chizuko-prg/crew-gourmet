import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useRestaurants } from "../lib/restaurantData";
import { useFavorites } from "../hooks/useFavorites";
import {
  availableHomeTags,
  sortByAddedAtDesc,
} from "../lib/restaurants";
import { PrimaryButton } from "../components/PrimaryButton";
import { FilterChip } from "../components/FilterChip";
import { RestaurantCard } from "../components/RestaurantCard";
import "./Home.css";

const RECENT_COUNT = 5;

export function Home() {
  const restaurants = useRestaurants();
  const navigate = useNavigate();
  const validIds = useMemo(() => new Set(restaurants.map((r) => r.id)), [restaurants]);
  const { isFavorite, toggle } = useFavorites(validIds);

  const homeTags = useMemo(() => availableHomeTags(restaurants), [restaurants]);
  const recent = useMemo(
    () => sortByAddedAtDesc(restaurants).slice(0, RECENT_COUNT),
    [restaurants],
  );

  return (
    <div>
      <header className="home-intro">
        <p className="home-intro__brand">Crew Gourmet</p>
        <h1 className="home-intro__headline">今日もおつかれさま。</h1>
        <p className="home-intro__body">
          航空関係者おすすめのお店を探しやすくまとめました。
        </p>
      </header>

      <PrimaryButton to="/areas">エリアから探す →</PrimaryButton>

      {homeTags.length > 0 ? (
        <section className="home-goals" aria-label="目的から探す">
          <h2 className="home-section-title">目的から探す</h2>
          <div className="home-goals__grid">
            {homeTags.map((tag) => (
              <FilterChip
                key={tag.key}
                label={tag.label}
                size="lg"
                onClick={() => navigate(`/restaurants?tags=${tag.key}`)}
              />
            ))}
          </div>
        </section>
      ) : null}

      {recent.length > 0 ? (
        <section aria-label="最近追加されたお店">
          <h2 className="home-section-title">最近追加されたお店</h2>
          {recent.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              isFavorite={isFavorite(restaurant.id)}
              onToggleFavorite={() => toggle(restaurant.id)}
            />
          ))}
        </section>
      ) : null}
    </div>
  );
}

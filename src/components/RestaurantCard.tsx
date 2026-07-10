import { Link } from "react-router-dom";
import type { Restaurant } from "../types/restaurant";
import { tagLabel } from "../lib/restaurants";
import { FeatureTag } from "./FeatureTag";
import { FavoriteButton } from "./FavoriteButton";
import { PrimaryButton } from "./PrimaryButton";
import "./RestaurantCard.css";

interface RestaurantCardProps {
  restaurant: Restaurant;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export function RestaurantCard({
  restaurant,
  isFavorite,
  onToggleFavorite,
}: RestaurantCardProps) {
  const locationLine = restaurant.access ?? restaurant.area;
  const topSummary = restaurant.crewSummary[0];

  return (
    <article className="restaurant-card">
      <div className="restaurant-card__head">
        <Link to={`/restaurants/${restaurant.id}`} className="restaurant-card__name-link">
          <h2 className="restaurant-card__name">{restaurant.name}</h2>
        </Link>
        <FavoriteButton
          active={isFavorite}
          onToggle={onToggleFavorite}
          label={restaurant.name}
        />
      </div>

      <p className="restaurant-card__meta">
        {restaurant.genre}
        {locationLine ? ` ・ ${locationLine}` : ""}
      </p>

      {topSummary ? (
        <p className="restaurant-card__summary">✈ {topSummary}</p>
      ) : null}

      {restaurant.tags.length > 0 ? (
        <div className="restaurant-card__tags">
          {restaurant.tags.map((tag) => (
            <FeatureTag key={tag} label={tagLabel(tag)} />
          ))}
        </div>
      ) : null}

      <PrimaryButton to={`/restaurants/${restaurant.id}`} variant="outline">
        詳細を見る
      </PrimaryButton>
    </article>
  );
}

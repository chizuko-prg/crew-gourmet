import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useRestaurants } from "../lib/restaurantData";
import { useFavorites } from "../hooks/useFavorites";
import {
  tagLabel,
  formatCheckedAt,
  buildGoogleMapsUrl,
  getRestaurantById,
} from "../lib/restaurants";
import { AppHeader } from "../components/AppHeader";
import { FeatureTag } from "../components/FeatureTag";
import { FavoriteButton } from "../components/FavoriteButton";
import { PrimaryButton } from "../components/PrimaryButton";
import { StatusNotice } from "../components/StatusNotice";
import { SafetyCard } from "../components/SafetyCard";
import { EmptyState } from "../components/EmptyState";
import "./RestaurantDetail.css";

export function RestaurantDetail() {
  const { id } = useParams<{ id: string }>();
  const restaurants = useRestaurants();
  const validIds = useMemo(() => new Set(restaurants.map((r) => r.id)), [restaurants]);
  const { isFavorite, toggle } = useFavorites(validIds);

  const restaurant = id ? getRestaurantById(restaurants, id) : undefined;

  if (!restaurant) {
    return (
      <div>
        <AppHeader title="お店が見つかりません" showBack />
        <EmptyState message="条件に合うお店はまだありません。条件を減らしてみてください。" />
      </div>
    );
  }

  const checkedAtText = formatCheckedAt(restaurant.checkedAt);

  return (
    <div>
      <AppHeader
        title={restaurant.name}
        showBack
        right={
          <FavoriteButton
            active={isFavorite(restaurant.id)}
            onToggle={() => toggle(restaurant.id)}
            label={restaurant.name}
          />
        }
      />

      <div className="detail-body">
        {restaurant.tags.length > 0 ? (
          <div className="detail-tags">
            {restaurant.tags.map((tag) => (
              <FeatureTag key={tag} label={tagLabel(tag)} />
            ))}
          </div>
        ) : null}

        <p className="detail-genre">{restaurant.genre}</p>

        {restaurant.crewSummary.length > 0 ? (
          <ul className="detail-summary">
            {restaurant.crewSummary.map((line, index) => (
              <li key={index}>✈ {line}</li>
            ))}
          </ul>
        ) : null}

        <dl className="detail-facts">
          {restaurant.access ? (
            <div className="detail-facts__row">
              <dt>アクセス</dt>
              <dd>{restaurant.access}</dd>
            </div>
          ) : null}
          {restaurant.specialty ? (
            <div className="detail-facts__row">
              <dt>名物料理</dt>
              <dd>{restaurant.specialty}</dd>
            </div>
          ) : null}
          {restaurant.hours ? (
            <div className="detail-facts__row">
              <dt>営業時間</dt>
              <dd>{restaurant.hours}</dd>
            </div>
          ) : null}
          {restaurant.closedDays ? (
            <div className="detail-facts__row">
              <dt>定休日</dt>
              <dd>{restaurant.closedDays}</dd>
            </div>
          ) : null}
        </dl>

        {restaurant.statusNote ? <StatusNotice message={restaurant.statusNote} /> : null}

        <PrimaryButton href={buildGoogleMapsUrl(restaurant.mapQuery)} target="_blank" rel="noopener noreferrer">
          写真・場所をGoogleマップで見る
        </PrimaryButton>

        {checkedAtText ? (
          <p className="detail-checked-at">最終確認：{checkedAtText}</p>
        ) : null}

        {restaurant.features.drink ? <SafetyCard /> : null}

        <p className="detail-disclaimer">
          営業時間・定休日などは変更される場合があります。ご来店前にGoogleマップや公式情報をご確認ください。
        </p>
      </div>
    </div>
  );
}

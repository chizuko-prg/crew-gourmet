import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useRestaurants } from "../lib/restaurantData";
import { getAirportSummaries } from "../lib/restaurants";
import { AppHeader } from "../components/AppHeader";
import "./Areas.css";

export function Areas() {
  const restaurants = useRestaurants();
  const airports = useMemo(() => getAirportSummaries(restaurants), [restaurants]);

  return (
    <div>
      <AppHeader title="エリアを選ぶ" showBack />
      {airports.map((airport) => (
        <section key={airport.airport} className="area-airport-group">
          <h2 className="area-airport-group__title">
            {airport.airport}
            <span className="area-airport-group__count">（{airport.count}件）</span>
          </h2>
          <ul className="area-airport-group__list">
            {airport.areas.map((area) => (
              <li key={area.area}>
                <Link
                  to={`/restaurants?airport=${encodeURIComponent(
                    airport.airport,
                  )}&area=${encodeURIComponent(area.area)}`}
                  className="area-row"
                >
                  <span className="area-row__name">{area.area}</span>
                  <span className="area-row__count">{area.count}件</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

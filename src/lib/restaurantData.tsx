import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import restaurantsUrl from "../data/restaurants.json?url";
import type { Restaurant } from "../types/restaurant";

type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "success"; restaurants: Restaurant[] };

const RestaurantListContext = createContext<Restaurant[] | null>(null);

export function RestaurantDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    fetch(restaurantsUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`restaurants.json fetch failed: ${response.status}`);
        }
        return response.json() as Promise<Restaurant[]>;
      })
      .then((data) => {
        if (!cancelled) {
          setState({ status: "success", restaurants: data });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState({ status: "error" });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === "loading") {
    return (
      <div className="app-shell">
        <main className="app-main" aria-busy="true">
          <p>読み込み中です…</p>
        </main>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="app-shell">
        <main className="app-main">
          <p>店舗情報を読み込めませんでした。時間をおいてもう一度お試しください。</p>
        </main>
      </div>
    );
  }

  return (
    <RestaurantListContext.Provider value={state.restaurants}>
      {children}
    </RestaurantListContext.Provider>
  );
}

export function useRestaurants(): Restaurant[] {
  const ctx = useContext(RestaurantListContext);
  if (ctx === null) {
    throw new Error("useRestaurants must be used within RestaurantDataProvider");
  }
  return ctx;
}

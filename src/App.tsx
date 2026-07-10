import { Route, Routes } from "react-router-dom";
import { RestaurantDataProvider } from "./lib/restaurantData";
import { BottomNavigation } from "./components/BottomNavigation";
import { Home } from "./pages/Home";
import { Areas } from "./pages/Areas";
import { Restaurants } from "./pages/Restaurants";
import { RestaurantDetail } from "./pages/RestaurantDetail";
import { Favorites } from "./pages/Favorites";

export function App() {
  return (
    <RestaurantDataProvider>
      <div className="app-shell">
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/areas" element={<Areas />} />
            <Route path="/restaurants" element={<Restaurants />} />
            <Route path="/restaurants/:id" element={<RestaurantDetail />} />
            <Route path="/favorites" element={<Favorites />} />
          </Routes>
        </main>
        <BottomNavigation />
      </div>
    </RestaurantDataProvider>
  );
}

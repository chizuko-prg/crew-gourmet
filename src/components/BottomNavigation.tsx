import { NavLink } from "react-router-dom";
import "./BottomNavigation.css";

const ITEMS = [
  { to: "/", label: "ホーム", icon: HomeIcon },
  { to: "/areas", label: "エリア", icon: AreaIcon },
  { to: "/favorites", label: "お気に入り", icon: HeartIcon },
];

export function BottomNavigation() {
  return (
    <nav className="bottom-nav" aria-label="主要メニュー">
      {ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          className={({ isActive }) =>
            "bottom-nav__item" + (isActive ? " bottom-nav__item--active" : "")
          }
        >
          <Icon />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 11.5 12 4l8 7.5M6 10v9h5v-5h2v5h5v-9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AreaIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s7-6.2 7-11.5a7 7 0 1 0-14 0C5 14.8 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9.5" r="2.4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 20s-7.5-4.6-9.6-9.2C1 7.7 2.6 4.5 6 4.1c2-.2 3.6.8 6 3.3 2.4-2.5 4-3.5 6-3.3 3.4.4 5 3.6 3.6 6.7C19.5 15.4 12 20 12 20Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

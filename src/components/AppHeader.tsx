import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import "./AppHeader.css";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  right?: ReactNode;
}

export function AppHeader({ title, subtitle, showBack, right }: AppHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="app-header">
      <div className="app-header__row">
        {showBack ? (
          <button
            type="button"
            className="app-header__back"
            onClick={() => navigate(-1)}
            aria-label="前の画面に戻る"
          >
            ←
          </button>
        ) : (
          <span className="app-header__back-spacer" aria-hidden="true" />
        )}
        <div className="app-header__titles">
          <h1 className="app-header__title">{title}</h1>
          {subtitle ? <p className="app-header__subtitle">{subtitle}</p> : null}
        </div>
        <div className="app-header__right">{right}</div>
      </div>
    </header>
  );
}

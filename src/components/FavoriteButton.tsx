import "./FavoriteButton.css";

interface FavoriteButtonProps {
  active: boolean;
  onToggle: () => void;
  label: string;
}

export function FavoriteButton({ active, onToggle, label }: FavoriteButtonProps) {
  return (
    <button
      type="button"
      className={"favorite-button" + (active ? " favorite-button--active" : "")}
      aria-pressed={active}
      aria-label={(active ? "お気に入りから外す：" : "お気に入りに追加：") + label}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onToggle();
      }}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 20s-7.5-4.6-9.6-9.2C1 7.7 2.6 4.5 6 4.1c2-.2 3.6.8 6 3.3 2.4-2.5 4-3.5 6-3.3 3.4.4 5 3.6 3.6 6.7C19.5 15.4 12 20 12 20Z"
          fill={active ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

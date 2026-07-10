import "./FilterChip.css";

interface FilterChipProps {
  label: string;
  selected?: boolean;
  size?: "sm" | "lg";
  onClick?: () => void;
}

export function FilterChip({ label, selected = false, size = "sm", onClick }: FilterChipProps) {
  return (
    <button
      type="button"
      className={
        "filter-chip" +
        (selected ? " filter-chip--selected" : "") +
        (size === "lg" ? " filter-chip--lg" : "")
      }
      aria-pressed={selected}
      onClick={onClick}
    >
      {label}
      {selected ? <span aria-hidden="true" className="filter-chip__close">×</span> : null}
    </button>
  );
}

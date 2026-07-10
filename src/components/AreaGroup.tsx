import type { ReactNode } from "react";
import "./AreaGroup.css";

interface AreaGroupProps {
  title: string;
  count?: number;
  children: ReactNode;
}

export function AreaGroup({ title, count, children }: AreaGroupProps) {
  return (
    <section className="area-group">
      <h2 className="area-group__title">
        {title}
        {typeof count === "number" ? (
          <span className="area-group__count">（{count}件）</span>
        ) : null}
      </h2>
      <div className="area-group__body">{children}</div>
    </section>
  );
}

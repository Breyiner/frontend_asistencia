import React, { useMemo } from "react";
import "../Badge/Badge.css";

export default function BadgesCompact({
  items = [],
  maxVisible = 1,
  empty = "—",
  badgeClassName = "badge badge--purple",
  moreClassName = "badge badge--fill-neutral",
  separatorTitle = ", ",
}) {
  const list = useMemo(() => (items ?? []).filter(Boolean), [items]);

  if (!list.length) return <span>{empty}</span>;

  const visible = list.slice(0, maxVisible);
  const remaining = list.length - visible.length;
  const title = remaining > 0 ? list.join(separatorTitle) : undefined;

  return (
    <span
      style={{ display: "inline-flex", alignItems: "center", gap: 6, flexWrap: "nowrap" }}
      title={title}
    >
      {visible.map((text, idx) => (
        <span key={`${text}-${idx}`} className={badgeClassName}>
          <span className="badge__text">{text}</span>
        </span>
      ))}

      {remaining > 0 ? (
        <span className={moreClassName}>
          <span className="badge__text">+{remaining}</span>
        </span>
      ) : null}
    </span>
  );
}
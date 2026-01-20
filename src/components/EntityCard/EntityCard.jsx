import "./EntityCard.css";
import "../../components/Badge/Badge.css";

export default function EntityCard({
  title,
  badges = [],
  isActive = false,
  activeBadgeText = "Actual",
  actions = [],
  className = "",
  children,
}) {
  return (
    <div className={`entity-card ${isActive ? "entity-card--active" : ""} ${className}`}>
      <div className="entity-card__header">
        <div className="entity-card__title-row">
          <h4 className="entity-card__title">{title}</h4>

          {badges.map((b, i) => (
            <span key={i} className={`badge ${b.className || ""}`.trim()}>
              {b.text}
            </span>
          ))}

          {isActive ? <span className="badge badge--fill-green">{activeBadgeText}</span> : null}
        </div>

        <div className="entity-card__actions">{actions}</div>
      </div>

      <div className="entity-card__body">{children}</div>
    </div>
  );
}
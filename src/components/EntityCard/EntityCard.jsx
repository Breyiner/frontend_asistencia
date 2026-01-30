import "./EntityCard.css";
import "../../components/Badge/Badge.css";
import BadgesCompact from "../BadgesCompact/BadgesCompact";

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

          <BadgesCompact
            items={badges.map((b) => b.text)}
            maxVisible={2}
            badgeClassName="badge badge--purple"
            moreClassName="badge badge--fill-neutral"
          />

          {isActive ? (
            <BadgesCompact
              items={[activeBadgeText]}
              maxVisible={1}
              badgeClassName="badge badge--fill-success"
            />
          ) : null}

        </div>

        <div className="entity-card__actions">{actions}</div>
      </div>

      <div className="entity-card__body">{children}</div>
    </div>
  );
}
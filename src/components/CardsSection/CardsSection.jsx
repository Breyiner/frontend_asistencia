import { Link } from "react-router-dom";
import "./CardsSection.css";

export default function CardsSection({
  title,
  actionTo,
  actionLabel = "+ Asociar",
  emptyText = "No hay registros",
  emptyActionLabel,
  items = [],
  renderItem,
}) {
  return (
    <div className="cards-section">
      <div className="cards-section__header">
        <h3 className="cards-section__title">{title}</h3>

        {actionTo ? (
          <Link className="link-btn link-btn--primary link-btn--sm" to={actionTo}>
            {actionLabel}
          </Link>
        ) : null}
      </div>

      <div className="cards-section__content">
        {items.map(renderItem)}
      </div>

      {items.length === 0 ? (
        <div className="cards-section__empty">
          <p>{emptyText}</p>
        </div>
      ) : null}
    </div>
  );
}
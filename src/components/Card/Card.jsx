import "./Card.css";

export default function Card({ title, variant = "default", className = "", children }) {
  return (
    <div className={`card card--${variant} ${className}`}>
      {title ? <h3 className={`card__title card__title--${variant}`}>{title}</h3> : null}
      <div className={`card__body card__body--${variant}`}>{children}</div>
    </div>
  );
}

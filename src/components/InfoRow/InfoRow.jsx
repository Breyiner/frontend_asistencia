import "./InfoRow.css";

export default function InfoRow({ label, value, variant = "" }) {
  return (
    <div className= {variant ? `info-row--${variant}` : "info-row"}>
      <div className="info-row__label">{label}:</div>
      <div className="info-row__value">{value ?? "-"}</div>
    </div>
  );
}

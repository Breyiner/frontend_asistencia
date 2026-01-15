import "./InfoRow.css";

export default function InfoRow({ label, value }) {
  return (
    <div className="info-row">
      <div className="info-row__label">{label}:</div>
      <div className="info-row__value">{value ?? "-"}</div>
    </div>
  );
}

import "./IconActionButton.css";

export default function IconActionButton({ title, onClick, color, children, className = "" }) {
  return (
    <button
      type="button"
      className={`icon-action-btn ${className}`}
      onClick={onClick}
      title={title}
      aria-label={title}
      style={color ? { color } : undefined}
    >
      {children}
    </button>
  );
}
import "./IconActionButton.css";

export default function IconActionButton({ title, onClick, color, children, className = "", ...props}) {
  return (
    <button
      type="button"
      className={`icon-action-btn ${className}`}
      onClick={onClick}
      title={title}
      aria-label={title}
      style={color ? { color } : undefined}
      {...props}
    >
      {children}
    </button>
  );
}
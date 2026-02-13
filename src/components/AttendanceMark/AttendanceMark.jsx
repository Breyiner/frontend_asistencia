import "./AttendanceMark.css";

export default function AttendanceMark({ status, size = "md" }) {
  const cls = `mark mark--${status} mark--${size}`;
  const glyph =
    status === "present" ? "✓" :
    status === "absent" ? "X" :
    status === "late" ? "!" :
    status === "excused_absence" ? "X" :
    status === "early_exit" ? "↗" :
    status === "unregistered" ? "-" : "";

  return (
    <span className={cls} aria-hidden="true">
      {glyph}
    </span>
  );
}
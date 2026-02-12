import React from "react";
import "./Pill.css";

export default function Pill({ children, variant = "danger" }) {
  const cls =
    variant === "warning"
      ? "pill pill--warning"
      : variant === "neutral"
      ? "pill pill--neutral"
      : "pill pill--danger";

  return <span className={cls}>{children}</span>;
}

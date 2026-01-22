export function weekdayEs(dateValue, locale = "es-CO") {
  if (!dateValue) return "";

  const d = typeof dateValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)
    ? new Date(`${dateValue}T12:00:00`)
    : new Date(dateValue);

  if (Number.isNaN(d.getTime())) return "";

  return d.toLocaleDateString(locale, { weekday: "long" });
}
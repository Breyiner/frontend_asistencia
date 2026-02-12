export const COLORS = {
  bg: "#f5f7fb",
  surface: "#ffffff",
  border: "#edf0f5",
  ink: "#101828",
  muted: "#667085",

  present: "#2EEA78",
  absent: "#FF6B6B",
  unregistered: "#94a3b8",
  excused_absence: "#8b5cf6",
  early_exit: "#5B8CFF",
  late: "#F7B84B",
};

export const num = (n) => new Intl.NumberFormat("es-CO").format(n ?? 0);
export const pct1 = (n) => `${Math.round((Number(n || 0) * 10)) / 10}%`;

export function statusLabel(code) {
  const map = {
    present: "Asistencia",
    absent: "Inasistencia",
    unregistered: "Sin registrar",
    late: "Tardanza",
    early_exit: "Salida anticipada",
    excused_absence: "Justificada",
  };
  return map[code] ?? code;
}

export function mapPieData(pieStatus) {
  return (pieStatus || []).map((x) => ({
    key: x.code,
    name: statusLabel(x.code),
    value: Number(x.pct || 0),
    count: Number(x.count || 0),
    color: COLORS[x.code] ?? "#94a3b8",
  }));
}

export function mapBarsByDay(barsByDay) {
  return (barsByDay || []).map((x) => {
    const dateStr = String(x.date || "");
    return {
      date: dateStr,
      dd: dateStr.slice(8, 10),
      mmdd: dateStr.slice(5),
      present: Number(x.present || 0),
      absent: Number(x.absent || 0),
    };
  });
}

export function calcRangeDays(from, to) {
  if (!from || !to) return 0;
  const a = new Date(from);
  const b = new Date(to);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 0;
  return Math.round((b - a) / 86400000) + 1;
}

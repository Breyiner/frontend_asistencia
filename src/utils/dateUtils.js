export function toDayLabels(iso) {
  const d = new Date(iso + "T00:00:00");
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dow = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"][d.getDay()];
  return { labelTop: dow, labelBottom: `${dd}/${mm}` };
}

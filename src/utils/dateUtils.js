/**
 * Convierte una fecha ISO a etiquetas para UI de calendario.
 * 
 * Genera dos etiquetas:
 * - labelTop: Día de la semana abreviado (3 letras)
 * - labelBottom: Fecha en formato DD/MM
 * 
 * Útil para headers de tablas de asistencia.
 * 
 * @function
 * @param {string} iso - Fecha en formato ISO (YYYY-MM-DD)
 * @returns {Object} Objeto con labelTop y labelBottom
 * 
 * @example
 * toDayLabels("2024-01-15");
 * // {
 * //   labelTop: "Lun",
 * //   labelBottom: "15/01"
 * // }
 * 
 * @example
 * // Uso en header de tabla
 * const labels = toDayLabels(date);
 * <th>
 *   <div>{labels.labelTop}</div>
 *   <div>{labels.labelBottom}</div>
 * </th>
 */
export function toDayLabels(iso) {
  // Crea Date a medianoche para evitar problemas de zona horaria
  const d = new Date(iso + "T00:00:00");
  
  // Extrae día y mes como strings de 2 dígitos
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0"); // +1 porque getMonth() es 0-indexed
  
  // Array de abreviaciones de días (domingo es índice 0)
  const dow = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"][d.getDay()];
  
  return { 
    labelTop: dow,           // Día de la semana abreviado
    labelBottom: `${dd}/${mm}` // Fecha DD/MM
  };
}
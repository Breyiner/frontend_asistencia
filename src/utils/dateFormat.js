/**
 * Obtiene el nombre del día de la semana en español.
 * 
 * Maneja diferentes formatos de entrada:
 * - Strings ISO (YYYY-MM-DD)
 * - Objetos Date
 * - Timestamps
 * 
 * Para strings ISO, agrega "T12:00:00" para evitar problemas
 * de zona horaria (el día puede cambiar si se parsea a medianoche).
 * 
 * @function
 * @param {string|Date} dateValue - Valor de fecha
 * @param {string} [locale="es-CO"] - Locale para el formato
 * @returns {string} Nombre del día en español o string vacío si inválido
 * 
 * @example
 * weekdayEs("2024-01-15")  // "lunes"
 * weekdayEs(new Date())     // "martes" (depende de hoy)
 * weekdayEs(null)           // ""
 * weekdayEs("invalid")      // ""
 */
export function weekdayEs(dateValue, locale = "es-CO") {
  // Si no hay valor, retorna vacío
  if (!dateValue) return "";

  // Si es string ISO (YYYY-MM-DD), agrega hora del mediodía
  // Esto evita problemas de zona horaria donde el día puede cambiar
  const d = typeof dateValue === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)
    ? new Date(`${dateValue}T12:00:00`) // Mediodía para estar seguro del día
    : new Date(dateValue);                // Parsea como Date normal

  // Si la fecha es inválida, retorna vacío
  if (Number.isNaN(d.getTime())) return "";

  // Retorna el día de la semana en español (completo)
  // weekday: "long" → "lunes", "martes", etc.
  return d.toLocaleDateString(locale, { weekday: "long" });
}
/**
 * Colores estándar del sistema de asistencias.
 * 
 * Define una paleta consistente usada en toda la aplicación
 * para estados de asistencia y elementos de UI.
 * 
 * @constant
 * @type {Object.<string, string>}
 */
export const COLORS = {
  // Colores de UI general
  bg: "#f5f7fb",           // Fondo general de la app
  surface: "#ffffff",      // Fondo de tarjetas/superficies
  border: "#edf0f5",       // Bordes y líneas divisoras
  ink: "#101828",          // Texto principal (casi negro)
  muted: "#667085",        // Texto secundario (gris)

  // Colores de estados de asistencia
  present: "#2EEA78",          // Verde - Presente
  absent: "#FF6B6B",           // Rojo - Ausente
  unregistered: "#94a3b8",     // Gris - Sin registrar
  excused_absence: "#8b5cf6",  // Morado - Ausencia justificada
  early_exit: "#5B8CFF",       // Azul - Salida anticipada
  late: "#F7B84B",             // Amarillo - Tardanza
};

/**
 * Formatea un número con separadores de miles según locale español.
 * 
 * @function
 * @param {number|null|undefined} n - Número a formatear
 * @returns {string} Número formateado (ej: "1.250")
 * 
 * @example
 * num(1250)    // "1.250"
 * num(null)    // "0"
 * num(undefined) // "0"
 */
export const num = (n) => new Intl.NumberFormat("es-CO").format(n ?? 0);

/**
 * Formatea un porcentaje con 1 decimal.
 * 
 * Redondea a 1 decimal usando Math.round.
 * Multiplica por 10, redondea, divide por 10.
 * 
 * @function
 * @param {number|null|undefined} n - Porcentaje a formatear (0-100)
 * @returns {string} Porcentaje formateado (ej: "92.5%")
 * 
 * @example
 * pct1(92.456)  // "92.5%"
 * pct1(0)       // "0%"
 * pct1(null)    // "0%"
 */
export const pct1 = (n) => `${Math.round((Number(n || 0) * 10)) / 10}%`;

/**
 * Mapea códigos de estado a etiquetas legibles en español.
 * 
 * @function
 * @param {string} code - Código de estado (present, absent, etc.)
 * @returns {string} Etiqueta legible en español
 * 
 * @example
 * statusLabel("present")  // "Asistencia"
 * statusLabel("absent")   // "Inasistencia"
 * statusLabel("unknown")  // "unknown" (fallback)
 */
export function statusLabel(code) {
  const map = {
    present: "Asistencia",
    absent: "Inasistencia",
    unregistered: "Sin registrar",
    late: "Tardanza",
    early_exit: "Salida anticipada",
    excused_absence: "Justificada",
  };
  // Retorna etiqueta o el código tal cual si no existe mapeo
  return map[code] ?? code;
}

/**
 * Transforma datos de estado de asistencia para gráfico de pie.
 * 
 * Convierte estructura del backend a estructura compatible con Recharts.
 * Agrega colores, etiquetas legibles y asegura tipos numéricos.
 * 
 * @function
 * @param {Array<Object>} pieStatus - Array de estados desde backend
 * @param {string} pieStatus[].code - Código del estado
 * @param {number|string} pieStatus[].pct - Porcentaje
 * @param {number|string} pieStatus[].count - Conteo
 * @returns {Array<Object>} Array transformado para Recharts
 * 
 * @example
 * const backendData = [
 *   { code: "present", pct: 85.5, count: 171 },
 *   { code: "absent", pct: 10.0, count: 20 }
 * ];
 * 
 * mapPieData(backendData);
 * // [
 * //   { key: "present", name: "Asistencia", value: 85.5, count: 171, color: "#2EEA78" },
 * //   { key: "absent", name: "Inasistencia", value: 10.0, count: 20, color: "#FF6B6B" }
 * // ]
 */
export function mapPieData(pieStatus) {
  return (pieStatus || []).map((x) => ({
    key: x.code,                          // Código original (para keys de React)
    name: statusLabel(x.code),            // Etiqueta legible
    value: Number(x.pct || 0),           // Porcentaje como número
    count: Number(x.count || 0),         // Conteo como número
    color: COLORS[x.code] ?? "#94a3b8",  // Color del estado (fallback gris)
  }));
}

/**
 * Transforma datos de asistencia por día para gráfico de barras.
 * 
 * Convierte estructura del backend a estructura compatible con Recharts.
 * Extrae partes de la fecha para diferentes formatos de etiquetas.
 * 
 * @function
 * @param {Array<Object>} barsByDay - Array de datos por día desde backend
 * @param {string} barsByDay[].date - Fecha ISO (YYYY-MM-DD)
 * @param {number|string} barsByDay[].present - Presentes
 * @param {number|string} barsByDay[].absent - Ausentes
 * @returns {Array<Object>} Array transformado para Recharts
 * 
 * @example
 * const backendData = [
 *   { date: "2024-01-15", present: 45, absent: 5 },
 *   { date: "2024-01-16", present: 48, absent: 2 }
 * ];
 * 
 * mapBarsByDay(backendData);
 * // [
 * //   { date: "2024-01-15", dd: "15", mmdd: "01-15", present: 45, absent: 5 },
 * //   { date: "2024-01-16", dd: "16", mmdd: "01-16", present: 48, absent: 2 }
 * // ]
 */
export function mapBarsByDay(barsByDay) {
  return (barsByDay || []).map((x) => {
    const dateStr = String(x.date || "");
    return {
      date: dateStr,                    // Fecha completa (YYYY-MM-DD)
      dd: dateStr.slice(8, 10),        // Solo día (DD)
      mmdd: dateStr.slice(5),          // Mes-día (MM-DD)
      present: Number(x.present || 0), // Presentes como número
      absent: Number(x.absent || 0),   // Ausentes como número
    };
  });
}

/**
 * Calcula la cantidad de días entre dos fechas.
 * 
 * Incluye ambas fechas en el cálculo (por eso el +1).
 * Maneja casos de error retornando 0.
 * 
 * @function
 * @param {string} from - Fecha de inicio (YYYY-MM-DD)
 * @param {string} to - Fecha de fin (YYYY-MM-DD)
 * @returns {number} Cantidad de días entre las fechas (inclusivo)
 * 
 * @example
 * calcRangeDays("2024-01-15", "2024-01-17")  // 3 días
 * calcRangeDays("2024-01-15", "2024-01-15")  // 1 día
 * calcRangeDays(null, "2024-01-15")          // 0 (error)
 * calcRangeDays("invalid", "2024-01-15")     // 0 (error)
 */
export function calcRangeDays(from, to) {
  // Si falta alguna fecha, retorna 0
  if (!from || !to) return 0;
  
  // Crea objetos Date
  const a = new Date(from);
  const b = new Date(to);
  
  // Si alguna fecha es inválida, retorna 0
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 0;
  
  // Calcula diferencia en milisegundos, convierte a días, redondea
  // 86400000 = milisegundos en un día (24 * 60 * 60 * 1000)
  // +1 para incluir ambos días
  return Math.round((b - a) / 86400000) + 1;
}
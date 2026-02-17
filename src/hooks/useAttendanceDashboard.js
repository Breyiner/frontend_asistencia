import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../services/apiClient";

/**
 * Estructura vacía del dashboard de asistencias.
 * 
 * Define la forma del objeto que se retorna cuando:
 * - No hay datos disponibles
 * - Hubo un error al cargar
 * - Los filtros no retornaron resultados
 * 
 * Esto previene errores de "undefined" en los componentes
 * que consumen el dashboard.
 * 
 * @constant
 * @type {Object}
 */
const EMPTY_DASH = {
  kpis: {
    total_apprentices: 0,
    total_present_marks: 0,
    attendance_avg_pct: 0,
    dropout_alert_count: 0,
  },
  pie_status: [],
  bars_by_day: [],
  top_fichas_absences: [],
  risk_apprentices: [],
};

/**
 * Construye el query string para el endpoint del dashboard.
 * 
 * Características:
 * - Filtra valores null, undefined o strings vacíos
 * - Convierte todos los valores a string
 * - Genera formato URLSearchParams válido
 * 
 * @function
 * @param {Object} paramsObj - Objeto con parámetros de filtro
 * @returns {string} Query string (ej: "from=2026-01-01&to=2026-01-31&ficha_id=5")
 * 
 * @example
 * buildDashboardQuery({
 *   from: "2026-01-01",
 *   to: "2026-01-31",
 *   ficha_id: 5,
 *   program_id: null, // Este se omite
 *   search: ""        // Este se omite
 * });
 * // "from=2026-01-01&to=2026-01-31&ficha_id=5"
 */
function buildDashboardQuery(paramsObj) {
  const params = new URLSearchParams();
  Object.entries(paramsObj || {}).forEach(([k, v]) => {
    // Omite valores null o undefined
    if (v === null || v === undefined) return;
    // Omite strings vacíos
    if (typeof v === "string" && v.trim() === "") return;
    // Convierte a string y añade al query
    params.append(k, String(v));
  });
  return params.toString();
}

/**
 * Hook personalizado para gestionar el dashboard de asistencias.
 * 
 * Carga y gestiona los datos del dashboard con soporte para:
 * - Filtros dinámicos (fechas, fichas, programas)
 * - Recarga manual
 * - Manejo de errores
 * - Información resumida (summary)
 * - Múltiples tipos de visualizaciones (KPIs, gráficos, tablas)
 * 
 * El dashboard incluye:
 * - **KPIs**: métricas clave (total aprendices, asistencia promedio, alertas)
 * - **pie_status**: datos para gráfico de torta de estados de asistencia
 * - **bars_by_day**: datos para gráfico de barras por día
 * - **top_fichas_absences**: ranking de fichas con más inasistencias
 * - **risk_apprentices**: lista de aprendices en riesgo de deserción
 * 
 * @hook
 * 
 * @param {Object} queryParams - Parámetros de filtro del dashboard
 * @param {string} [queryParams.from] - Fecha inicio (YYYY-MM-DD)
 * @param {string} [queryParams.to] - Fecha fin (YYYY-MM-DD)
 * @param {string|number} [queryParams.ficha_id] - ID de ficha para filtrar
 * @param {string|number} [queryParams.training_program_id] - ID de programa para filtrar
 * @param {string} [queryParams.preset] - Preset de fecha (7d, 30d, month, custom)
 * 
 * @returns {Object} Objeto con datos y funciones del dashboard
 * @returns {Object} return.dash - Datos del dashboard (estructura EMPTY_DASH)
 * @returns {Object} return.dash.kpis - Indicadores clave de rendimiento
 * @returns {Array} return.dash.pie_status - Datos para gráfico de torta
 * @returns {Array} return.dash.bars_by_day - Datos para gráfico de barras
 * @returns {Array} return.dash.top_fichas_absences - Top fichas con inasistencias
 * @returns {Array} return.dash.risk_apprentices - Aprendices en riesgo
 * @returns {Object|null} return.summary - Información resumida de la respuesta
 * @returns {boolean} return.loading - Si está cargando datos
 * @returns {string} return.err - Mensaje de error si hubo fallo
 * @returns {Function} return.reload - Función para recargar datos manualmente
 * @returns {Function} return.clearError - Función para limpiar mensaje de error
 * @returns {Function} return.setDashToEmpty - Función para resetear dashboard a vacío
 * 
 * @example
 * function DashboardPage() {
 *   const [filters, setFilters] = useState({
 *     from: "2026-01-01",
 *     to: "2026-01-31",
 *     ficha_id: 5
 *   });
 * 
 *   const { dash, summary, loading, err, reload, clearError } = useAttendanceDashboard(filters);
 * 
 *   if (loading) return <Spinner />;
 *   if (err) return <ErrorBanner message={err} onClose={clearError} />;
 * 
 *   return (
 *     <div>
 *       <KPICards kpis={dash.kpis} />
 *       <PieChart data={dash.pie_status} />
 *       <BarChart data={dash.bars_by_day} />
 *       <TopFichasTable rows={dash.top_fichas_absences} />
 *       <RiskApprenticesList apprentices={dash.risk_apprentices} />
 *       <button onClick={reload}>Recargar</button>
 *     </div>
 *   );
 * }
 */
export function useAttendanceDashboard(queryParams) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [dash, setDash] = useState(EMPTY_DASH);
  const [summary, setSummary] = useState(null);

  /**
   * Query string memoizado.
   * 
   * Solo se recalcula cuando cambian los queryParams,
   * evitando reconstrucciones innecesarias del string.
   */
  const qs = useMemo(() => buildDashboardQuery(queryParams), [queryParams]);

  /**
   * Carga los datos del dashboard desde la API.
   * 
   * - Construye el endpoint con el query string
   * - Maneja respuestas exitosas y errores
   * - Preserva el summary incluso si hay error
   * - useCallback con dependencia [qs] previene recreación
   *   pero se actualiza cuando cambian los filtros
   */
  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setErr("");

    try {
      const res = await api.get(`dashboard/attendance?${qs}`);

      if (!res.ok) {
        setErr(res.message || "No se pudo cargar el dashboard.");
        setDash(EMPTY_DASH);
        // Preserva el summary incluso en error (puede tener info útil)
        setSummary(res.summary ?? null);
        return;
      }

      // Éxito: actualiza datos
      setDash(res.data || EMPTY_DASH);
      setSummary(res.summary ?? null);
    } catch (e) {
      setErr(e?.message || "Error de conexión.");
      setDash(EMPTY_DASH);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [qs]);

  // Carga datos automáticamente cuando cambia el query string
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  /**
   * Recarga manualmente los datos del dashboard.
   * 
   * Útil para botones de "Recargar" o después de realizar
   * cambios que afecten las estadísticas.
   * 
   * @async
   */
  const reload = async () => {
    await fetchDashboard();
  };

  /**
   * Limpia el mensaje de error.
   * 
   * Útil para cerrar banners de error sin recargar datos.
   */
  const clearError = () => setErr("");

  /**
   * Resetea el dashboard a estado vacío.
   * 
   * Útil al cambiar filtros radicalmente o al desmontar.
   */
  const setDashToEmpty = () => setDash(EMPTY_DASH);

  return { dash, summary, loading, err, reload, clearError, setDashToEmpty };
}

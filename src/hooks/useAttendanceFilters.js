import { useState } from "react";
import useCatalog from "./useCatalog";

/**
 * Hook personalizado para gestionar filtros del dashboard de asistencias.
 * 
 * Maneja todos los filtros disponibles para el dashboard:
 * - **Presets de fecha**: rangos predefinidos (últimos 7 días, 30 días, mes actual)
 * - **Rango personalizado**: fechas from/to
 * - **Filtro por programa**: training_program_id
 * - **Filtro por ficha**: ficha_id
 * 
 * Características:
 * - Estado centralizado de filtros
 * - Integración con catálogo de programas
 * - Función de reseteo
 * - Setters individuales para cada filtro
 * 
 * Los presets disponibles:
 * - **7d**: Últimos 7 días
 * - **month**: Mes actual (calendario)
 * - **30d**: Últimos 30 días
 * - **custom**: Rango personalizado (usa from/to)
 * 
 * @hook
 * 
 * @returns {Object} Objeto con estado y funciones de filtros
 * @returns {string} return.preset - Preset seleccionado ("7d" | "month" | "30d" | "custom")
 * @returns {Function} return.setPreset - Establece el preset
 * @returns {string} return.from - Fecha inicio (YYYY-MM-DD)
 * @returns {Function} return.setFrom - Establece fecha inicio
 * @returns {string} return.to - Fecha fin (YYYY-MM-DD)
 * @returns {Function} return.setTo - Establece fecha fin
 * @returns {string} return.trainingProgramId - ID del programa seleccionado
 * @returns {Function} return.setTrainingProgramId - Establece programa
 * @returns {string} return.fichaId - ID de la ficha seleccionada
 * @returns {Function} return.setFichaId - Establece ficha
 * @returns {Function} return.reset - Resetea todos los filtros a valores por defecto
 * @returns {Object} return.programsCatalog - Hook useCatalog con programas
 * @returns {Array} return.programsCatalog.options - Opciones de programas [{value, label}]
 * @returns {boolean} return.programsCatalog.loading - Si está cargando programas
 * 
 * @example
 * function AttendanceDashboardPage() {
 *   const {
 *     preset,
 *     setPreset,
 *     from,
 *     setFrom,
 *     to,
 *     setTo,
 *     trainingProgramId,
 *     setTrainingProgramId,
 *     fichaId,
 *     setFichaId,
 *     reset,
 *     programsCatalog
 *   } = useAttendanceFilters();
 * 
 *   // Construye el objeto de parámetros para el dashboard
 *   const queryParams = {
 *     preset: preset !== "custom" ? preset : undefined,
 *     from: preset === "custom" ? from : undefined,
 *     to: preset === "custom" ? to : undefined,
 *     training_program_id: trainingProgramId,
 *     ficha_id: fichaId
 *   };
 * 
 *   const { dash, loading } = useAttendanceDashboard(queryParams);
 * 
 *   return (
 *     <div>
 *       <FilterBar
 *         preset={preset}
 *         onPresetChange={setPreset}
 *         from={from}
 *         onFromChange={setFrom}
 *         to={to}
 *         onToChange={setTo}
 *         programs={programsCatalog.options}
 *         programId={trainingProgramId}
 *         onProgramChange={setTrainingProgramId}
 *         onReset={reset}
 *       />
 *       <Dashboard data={dash} loading={loading} />
 *     </div>
 *   );
 * }
 */
export function useAttendanceFilters() {
  // Preset de fecha: "7d" por defecto (últimos 7 días)
  const [preset, setPreset] = useState("7d");
  
  // Rango de fechas personalizado (solo se usan si preset === "custom")
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  
  // Filtros de entidades
  const [trainingProgramId, setTrainingProgramId] = useState("");
  const [fichaId, setFichaId] = useState("");

  /**
   * Carga el catálogo de programas de formación.
   * 
   * useCatalog es un hook reutilizable que carga opciones
   * desde un endpoint y las formatea como [{value, label}].
   */
  const programsCatalog = useCatalog("training_programs/select");

  /**
   * Resetea todos los filtros a sus valores por defecto.
   * 
   * Valores por defecto:
   * - preset: "7d"
   * - from/to: vacíos
   * - trainingProgramId/fichaId: vacíos
   * 
   * Útil para botón "Limpiar filtros" o "Resetear".
   */
  const reset = () => {
    setPreset("7d");
    setFrom("");
    setTo("");
    setTrainingProgramId("");
    setFichaId("");
  };

  return {
    preset,
    setPreset,
    from,
    setFrom,
    to,
    setTo,
    trainingProgramId,
    setTrainingProgramId,
    fichaId,
    setFichaId,
    reset,
    programsCatalog,
  };
}

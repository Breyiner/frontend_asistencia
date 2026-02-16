import { useMemo } from "react";  // Solo useMemo para optimizar key
import useCatalog from "./useCatalog";  // Hook base reutilizable

/**
 * **Wrapper inteligente de useCatalog para fichas filtradas por programa.**
 * 
 * **Lógica de endpoint dinámico:**
 * - Si hay trainingProgramId → `fichas/training_program/{id}`
 * - Si no → `fichas/select` (todas las fichas)
 * 
 * Útil en formularios donde:
 * 1. Usuario selecciona programa
 * 2. Automáticamente carga fichas de ese programa
 * 
 * **Ejemplo de uso:**
 * <SelectProgram onChange={setProgramId} />
 * <SelectFicha options={fichas.options} />
 * 
 * @hook
 * @param {string|number} trainingProgramId - ID del programa (opcional)
 * @returns {Object} Catálogo de fichas filtradas
 */
export function useFichasByProgramCatalog(trainingProgramId) {
  /**
   * Genera **endpoint dinámico** con useMemo.
   * 
   * **Casos:**
   * trainingProgramId = 5 → "fichas/training_program/5"
   * trainingProgramId = null → "fichas/select"
   * 
   * Stringify evita problemas con números como keys.
   * 
   * useMemo → evita recreación innecesaria del string
   */
  const key = useMemo(() => {
    return trainingProgramId
      ? `fichas/training_program/${trainingProgramId}`  // Endpoint filtrado
      : "fichas/select";  // Endpoint con todas las fichas
  }, [trainingProgramId]);  // Única dependencia

  /**
   * Delega a useCatalog con la key correcta.
   * 
   * ✅ Carga automática cuando cambia trainingProgramId
   * ✅ Formato estándar {options, loading}
   * ✅ Manejo completo de errores/carga
   */
  return useCatalog(key);
}

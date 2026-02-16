import { useCallback, useEffect, useState } from "react";  // useCallback optimiza recargas
import { api } from "../services/apiClient";  // Cliente HTTP con auth
import { confirm, error, success } from "../utils/alertas";  // Alertas preconfiguradas

/**
 * Hook para **horario de un trimestre específico de ficha** (FichaTerm).
 * 
 * FichaTerm = trimestre asociado a una ficha.
 * 
 * Carga:
 * - Horario completo del trimestre (schedule_sessions)
 * - Estados de carga/error
 * - Función para eliminar sesiones individuales
 * 
 * Endpoint principal:
 * GET schedules/ficha_term/{fichaTermId}
 * 
 * @hook
 * @param {Object} props
 * @param {number|string} props.fichaTermId - ID del FichaTerm
 * 
 * @returns {Object} Datos del horario
 */
export default function useFichaTermSchedule({ fichaTermId }) {
  // Horario cargado desde API (array de schedule_sessions)
  const [schedule, setSchedule] = useState(null);
  
  // Loading global (carga inicial + eliminar)
  const [loading, setLoading] = useState(false);

  /**
   * Carga horario del FichaTerm desde API.
   * 
   * **Condiciones:**
   * - Si !fichaTermId → retorna (no hay trimestre)
   * 
   * **Flujo:**
   * 1. setLoading(true)
   * 2. GET schedules/ficha_term/{id}
   * 3. Si res.ok → setSchedule(res.data)
   * 4. Si !res.ok → null + error
   * 5. FINALLY → loading false
   * 
   * useCallback con [fichaTermId] → recrea solo al cambiar trimestre
   */
  const fetchSchedule = useCallback(async () => {
    // Previene llamadas sin ID válido
    if (!fichaTermId) return;
    
    // Spinner global
    setLoading(true);
    
    try {
      // Endpoint específico: horario de UN FichaTerm
      const res = await api.get(`schedules/ficha_term/${fichaTermId}`);
      
      if (!res.ok) {
        // Error específico (ej: "Trimestre no encontrado")
        setSchedule(null);
        await error(res.message || "No se pudo cargar el horario.");
        return;
      }
      
      
      // Guarda horario completo
      setSchedule(res.data);
    } finally {
      // SIEMPRE desactiva loading
      setLoading(false);
    }
  }, [fichaTermId]);  // Única dependencia

  // Carga automática al cambiar fichaTermId
  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  /**
   * Elimina una sesión específica del horario.
   * 
   * **Flujo de confirmación:**
   * 1. confirm() → "¿Eliminar este día del horario?"
   * 2. Si cancela → false
   * 3. DELETE schedule_sessions/{sessionId}
   * 4. Si éxito → recarga horario + success
   * 5. Si error → error + false
   * 
   * useCallback con [fetchSchedule] → referencia estable
   */
  const deleteSession = useCallback(
    async (sessionId) => {
      // Confirmación del usuario
      const confirmed = await confirm("¿Eliminar este día del horario?");
      if (!confirmed.isConfirmed) return false;

      try {
        setLoading(true);  // Spinner durante DELETE

        // Elimina sesión específica
        const res = await api.delete(`schedule_sessions/${sessionId}`);

        if (!res.ok) {
          await error(res.message || "No se pudo eliminar la sesión.");
          return false;
        }

        await success(res.message || "Sesión eliminada.");
        // Recarga horario completo para reflejar cambios
        await fetchSchedule();
        return true;
      } catch (e) {
        await error(e?.message || "Error de conexión.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchSchedule]  // Recarga después de eliminar
  );

  /**
   * API pública simple.
   * ✅ refetch: alias legible de fetchSchedule
   */
  return {
    schedule,      // Horario cargado (null si error)
    loading,       // Spinner global
    refetch: fetchSchedule,  // Recarga manual
    deleteSession  // Eliminar sesión específica
  };
}

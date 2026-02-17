import { useCallback, useEffect, useState } from "react";  // useCallback optimiza fetch, useEffect carga automática
import { api } from "../services/apiClient";  // Cliente HTTP con autenticación automática
import { error } from "../utils/alertas";  // Wrapper de SweetAlert2 preconfigurado

/**
 * Hook para cargar asistencias de una **clase real específica**.
 * 
 * Una "clase real" = sesión concreta de formación:
 * - Fecha específica
 * - Hora de inicio/fin
 * - Instructor asignado
 * - Ambiente asignado
 * - Lista de aprendices que asisten
 * 
 * Este hook trae:
 * - Todas las asistencias (marcas) de esa sesión
 * - Resumen estadístico (presentes, ausentes, etc.)
 * - Estados de carga y error
 * 
 * [DESCRIPCIÓN COMPLETA EN EL BLOQUE JSDOC ARRIBA]
 */
export default function useAttendancesByRealClass(realClassId) {
  // Lista de asistencias cargadas desde la API
  // Formato: [{ id, apprentice_id, status, entry_hour, observations, ... }]
  const [attendances, setAttendances] = useState([]);
  
  // Resumen estadístico de la clase (opcional)
  // Ej: { present: 25, absent: 3, total: 28, avg_attendance: 89.3 }
  const [summary, setSummary] = useState(null);
  
  // Estado de carga específico para asistencias (no afecta otros estados)
  const [loadingAttendances, setLoadingAttendances] = useState(false);

  /**
   * Función maestra para cargar asistencias desde la API.
   * 
   * **Condiciones de ejecución:**
   * - Si !realClassId: retorna inmediatamente (no hay clase que cargar)
   * 
   * **Flujo detallado:**
   * 1. Activa loadingAttendances → muestra spinner
   * 2. GET attendances/class/{realClassId}
   * 3. Si res.ok:
   *    - setAttendances(res.data || []) → array vacío si no hay datos
   *    - setSummary(res.summary || null) → null si no viene
   * 4. Si !res.ok:
   *    - Limpia datos: arrays vacíos, summary null
   *    - Muestra alerta con mensaje específico de la API
   * 5. Si error de red/timeout:
   *    - Limpia datos
   *    - Alerta genérica "Error de conexión"
   * 6. FINALLY: desactiva loading
   * 
   * **useCallback optimización:**
   * - Dependencia [realClassId] → se recrea SOLO cuando cambia la clase
   * - Evita llamadas infinitas en useEffect
   */
  const fetchAttendances = useCallback(async () => {
    // Previene llamadas si no hay ID válido de clase real
    if (!realClassId) return;

    // Activa spinner específico para asistencias
    setLoadingAttendances(true);
    
    try {
      // Endpoint específico: asistencias de UNA clase real
      const res = await api.get(`attendances/class/${realClassId}`);

      // Respuesta exitosa HTTP 200
      if (!res.ok) {
        // Limpia datos previos (evita datos "fantasma" de clases anteriores)
        setAttendances([]);
        setSummary(null);
        
        // Alerta específica del backend (ej: "Clase no encontrada")
        await error(res.message || "No se pudieron cargar las asistencias.");
        return;  // Sale temprano
      }

      // Éxito: actualiza estado con datos frescos
      // || [] previene errores si res.data es null/undefined
      setAttendances(res.data || []);
      // || null maneja caso sin summary
      setSummary(res.summary || null);
      
    } catch (e) {
      // Error de red, timeout, CORS, 5xx no capturado por apiClient
      console.error("Error cargando asistencias:", e);
      
      // Limpia datos en caso de fallo
      setAttendances([]);
      setSummary(null);
      
      // Alerta genérica para el usuario
      await error(e?.message || "Error de conexión.");
      
    } finally {
      // SIEMPRE desactiva loading, incluso en error
      // Garantiza que el spinner desaparezca
      setLoadingAttendances(false);
    }
  }, [realClassId]);  // ÚNICA dependencia → recrea callback solo al cambiar clase

  /**
   * useEffect automático: carga datos al montar y al cambiar realClassId.
   * 
   * Dependencia [fetchAttendances] → ejecuta cuando cambia el callback
   * (lo que ocurre cuando cambia realClassId)
   * 
   * React garantiza orden: fetchAttendances → useEffect
   */
  useEffect(() => {
    fetchAttendances();
  }, [fetchAttendances]);

  /**
   * Objeto público del hook.
   * 
   * ✅ setAttendances: permite actualizaciones optimistas locales
   * ✅ refetchAttendances: alias de fetchAttendances para componentes
   */
  return {
    attendances,           // Array de asistencias cargadas
    setAttendances,        // Setter público (para optimismo)
    summary,               // Resumen estadístico
    setSummary,            // Setter público (para optimismo)
    loadingAttendances,    // Spinner específico
    refetchAttendances: fetchAttendances,  // Alias legible para componentes
  };
}

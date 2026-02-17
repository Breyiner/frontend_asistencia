import { useCallback, useEffect, useState } from "react";
import { api } from "../services/apiClient";

/**
 * Hook especializado para cargar OPCIONES DE SESIONES PROGRAMADAS
 * asociadas a una ficha específica (grupo / programa / cohorte).
 * 
 * Uso principal:
 * - Poblar <select> de schedule_session_id en formularios de clases reales
 * - Carga dinámica al cambiar ficha_id
 * - Formato listo para react-select o <select> nativo: {value, label}
 */
export default function useScheduleSessionsByFicha(fichaId) {
  // Opciones formateadas para el selector
  // Ej: [{ value: "123", label: "Sesión de inducción - Mañana" }, ...]
  const [options, setOptions] = useState([]);

  // Indicador de carga (para mostrar "Cargando sesiones..." o spinner)
  const [loading, setLoading] = useState(false);

  /**
   * Carga las sesiones programadas asociadas a la ficha.
   * Memoizada para evitar recreación innecesaria.
   */
  const fetchOptions = useCallback(async () => {
    // Caso borde: sin ficha → opciones vacías
    if (!fichaId) {
      setOptions([]);
      return;
    }

    setLoading(true);

    try {
      // Endpoint específico por ficha
      const res = await api.get(`schedule_sessions/ficha/${fichaId}`);

      if (!res.ok) {
        setOptions([]);   // Limpieza en caso de error
        return;
      }

      // Transformamos datos crudos a formato {value, label}
      const opts = (res.data || []).map((x) => ({
        value: String(x.id),                        // Siempre string para <select>
        label: x.name || x.label || `Sesión #${x.id}`, // Fallback si no hay nombre
      }));

      setOptions(opts);

    } catch (err) {
      console.error("Error cargando sesiones por ficha:", err);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, [fichaId]);   // Solo se recrea si cambia la ficha

  // Carga automática al montar o cambiar fichaId
  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  return {
    options,           // Lista lista para <Select options={options} />
    loading,           // ¿Está cargando?
    refetch: fetchOptions,   // Para recargar manualmente si es necesario
  };
}
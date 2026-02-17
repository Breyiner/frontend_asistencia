import { useState, useEffect, useCallback } from "react";
import { api } from "../services/apiClient";

/**
 * **Hook reutilizable para listas paginadas con filtros.**
 * 
 * Para tablas/colecciones grandes con:
 * - Paginación (page, per_page)
 * - Filtros dinámicos (search, status, date_from, etc.)
 * - Estados de carga
 * 
 * **Flujo automático:**
 * 1. Carga datos al montar
 * 2. Recarga cuando cambian filtros/page
 * 3. Maneja paginación del backend
 * 
 * **Backend esperado:**
 * GET /endpoint?page=1&per_page=10&search=texto → {
 *   data: [...],
 *   paginate: { total: 150, current_page: 1, last_page: 15 }
 * }
 * 
 * @hook
 * 
 * @param {Object} props
 * @param {string} props.endpoint - Endpoint base (ej: "apprentices")
 * @param {Object} [props.initialFilters={}] - Filtros iniciales
 * 
 * @returns {Object} Estado de la lista
 * @returns {Array} return.data - Items de la página actual
 * @returns {boolean} return.loading - Estado de carga
 * @returns {number} return.total - Total de registros (para paginador)
 * @returns {Object} return.filters - Filtros actuales
 * @returns {Function} return.setFilters - Actualiza filtros (recarga automática)
 * @returns {Function} return.refetch - Recarga manual
 */
export default function useDataList({ endpoint, initialFilters = {} }) {
  // Datos de la página actual (ej: 10 aprendices)
  const [data, setData] = useState([]);
  
  // Estado de carga global
  const [loading, setLoading] = useState(false);
  
  // Total de registros (para paginador)
  const [total, setTotal] = useState(0);
  
  // Filtros + paginación actuales
  const [filters, setFilters] = useState({
    page: 1,              // Página actual
    per_page: 10,         // Registros por página
    ...initialFilters,    // Filtros iniciales (search, status, etc.)
  });

  /**
   * Función maestra de carga paginada.
   * 
   * **Construcción de query string ULTRA-DETALLADA:**
   * 1. Crea URLSearchParams vacío
   * 2. Itera todos los filtros
   * 3. Omite valores falsy ("" | null | undefined)
   * 4. Convierte a string → ?page=1&per_page=10&search=texto
   * 
   * **Flujo de respuesta:**
   * 1. setLoading(true)
   * 2. GET endpoint?querystring
   * 3. Si res.ok:
   *    - data = res.data || []
   *    - total = res.paginate?.total || 0
   * 4. Si !res.ok → limpia todo
   * 5. Error → limpia y log
   * 6. FINALLY → loading false
   * 
   * **useCallback optimización:** [endpoint, filters]
   */
  const fetchData = useCallback(async () => {
    // Activa spinner de tabla
    setLoading(true);
    
    try {
      // Construye query string dinámico
      const params = new URLSearchParams();
      
      // Itera TODOS los filtros activos
      Object.entries(filters).forEach(([key, value]) => {
        // Omite valores "vacíos" (no añade al query)
        if (value !== "" && value !== null && value !== undefined) {
          // Convierte a string (maneja números, booleanos)
          params.append(key, value);
        }
      });

      // Ejemplo final: apprentices?page=1&per_page=10&status=active&search=ju
      const res = await api.get(`${endpoint}?${params.toString()}`);

      // Respuesta exitosa
      if (res.ok) {
        // Items de la página actual
        setData(res.data || []);
        // Total para paginador (res.paginate.total)
        setTotal(res.paginate?.total || 0);
      } else {
        // Error HTTP: limpia datos
        setData([]);
        setTotal(0);
      }
    } catch (error) {
      // Error de red/timeout
      console.error("Error fetching data:", error);
      // Limpia datos en fallo
      setData([]);
      setTotal(0);
    } finally {
      // SIEMPRE desactiva loading
      setLoading(false);
    }
  }, [endpoint, filters]);  // Recrea cuando cambian endpoint o filtros

  /**
   * Carga automática al montar y cuando cambian filtros/page.
   * 
   * Dependencia [fetchData] → ejecuta cuando cambia el callback
   */
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Recarga manual de datos.
   * 
   * Útil para:
   * - Botón "Recargar"
   * - Después de crear/editar/borrar
   * - Polling periódico
   * 
   * useCallback con [fetchData] → referencia estable
   */
  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  /**
   * API pública completa.
   * ✅ setFilters recarga automáticamente (useEffect)
   * ✅ Manejo total de estados de carga/error
   */
  return {
    data,        // Items actuales (página actual)
    loading,     // Spinner de tabla
    total,       // Total registros (para paginador)
    filters,     // Filtros + paginación actuales
    setFilters,  // Actualiza filtros → recarga automática
    refetch,     // Recarga manual
  };
}

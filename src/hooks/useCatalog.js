import { useEffect, useState, useCallback } from "react";  // useCallback optimiza recargas, useEffect carga automática
import { api } from "../services/apiClient";  // Cliente HTTP con auth interceptors

/**
 * **Hook reutilizable para catálogos/options de selects.**
 * 
 * Transforma respuestas de API en formato estándar para React Select / selects nativos:
 * 
 * **Entrada:** Array de objetos {id, name, ...}
 * **Salida:** Array [{value: "1", label: "Nombre"}, ...]
 * 
 * **Casos de uso típicos:**
 * - `useCatalog("training_programs/select")` → programas para select
 * - `useCatalog("document_types")` → tipos de documento
 * - `useCatalog("shifts")` → turnos (mañana, tarde)
 * 
 * **Configuración opcional:**
 * - `keep: true` → guarda objeto original como `opt.item`
 * - `mapLabel: fn` → función personalizada para generar label
 * 
 * **Endpoints esperados:**
 * GET /endpoint → {data: [{id: 1, name: "Nombre"}, ...]}
 * 
 * @hook
 * 
 * @param {string} endpoint - Endpoint de la API (ej: "training_programs/select")
 * @param {Object} [config={}] - Configuración opcional
 * @param {boolean} [config.keep=false] - Si guarda objeto original como `opt.item`
 * @param {Function} [config.mapLabel] - Función personalizada para generar label
 * 
 * @returns {Object} Estado del catálogo
 * @returns {Array<{value: string, label: string, item?: Object}>} return.options - Opciones formateadas
 * @returns {boolean} return.loading - Si está cargando datos
 * 
 * @example
 * // Catálogo simple de programas
 * const programs = useCatalog("training_programs/select");
 * 
 * // Con objeto original preservado
 * const areas = useCatalog("areas", { keep: true });
 * // options[0].item = {id: 1, name: "Desarrollo", description: "..."}
 * 
 * // Label personalizado
 * const fichas = useCatalog("fichas", {
 *   mapLabel: (item) => `${item.ficha_number} - ${item.training_program_name}`
 * });
 */
export default function useCatalog(endpoint, config = {}) {
  // Destructuración de configuración con valores por defecto
  const { keep = false, mapLabel } = config;

  // Opciones finales en formato [{value, label}]
  const [options, setOptions] = useState([]);
  
  // Estado de carga (spinner en selects)
  const [loading, setLoading] = useState(true);

  /**
   * Función principal de carga y transformación de datos.
   * 
   * **Flujo ultra-detallado:**
   * 1. setLoading(true) → activa spinner
   * 2. GET endpoint → api.get maneja auth/headers automáticos
   * 3. Si res.ok:
   *    a. Toma res.data || [] → array vacío si null
   *    b. Mapea cada item → {value, label}
   *    c. value = String(item.id) → siempre string para React Select
   *    d. label = mapLabel(item) o fallback por campo común
   *    e. Si keep=true → opt.item = item original
   *    f. setOptions(mapped)
   * 4. Si !res.ok → setOptions([])
   * 5. FINALLY → setLoading(false)
   * 
   * **Fallback inteligente para label:**
   * name → number → full_name → ficha_number → ""
   * 
   * **useCallback optimización:**
   * Dependencias [endpoint, keep, mapLabel] → recrea SOLO si cambian
   */
  const load = useCallback(async () => {
    // Activa spinner en el select
    setLoading(true);
    
    try {
      // GET directo al endpoint (ej: "training_programs/select")
      // api.get añade Authorization header automáticamente
      const res = await api.get(endpoint);

      // Respuesta exitosa HTTP 200
      if (res.ok) {
        // res.data || [] previene crash si data es null
        const mapped = (res.data || []).map((item) => {
          /**
           * Generación inteligente del label.
           * 
           * Prioridad de campos comunes:
           * 1. mapLabel(item) → función personalizada
           * 2. item.name → nombre genérico
           * 3. item.number → números (fichas, documentos)
           * 4. item.full_name → personas
           * 5. item.ficha_number → fichas específicas
           * 6. "" → fallback vacío
           */
          const label =
            typeof mapLabel === "function"
              ? mapLabel(item)  // Usuario personaliza label
              : item.name || item.number || item.full_name || item.ficha_number || "";  // Fallback inteligente

          // Objeto estándar para React Select / <select>
          const opt = {
            value: String(item.id),  // SIEMPRE string para consistencia
            label,                   // Texto visible
          };

          // Preserva objeto original si keep=true
          // Útil para acceder a datos adicionales al seleccionar
          if (keep) opt.item = item;

          return opt;
        });

        // Actualiza opciones con datos transformados
        setOptions(mapped);
      } else {
        // Error HTTP (4xx, 5xx): limpia opciones
        setOptions([]);
      }
    } finally {
      // SIEMPRE desactiva loading (garantía de UX)
      setLoading(false);
    }
  }, [endpoint, keep, mapLabel]);  // Dependencias críticas

  /**
   * Carga automática al montar y cuando cambian las dependencias.
   * 
   * Dependencia [load] → ejecuta cuando cambia el callback
   * (endpoint, keep, mapLabel)
   */
  useEffect(() => {
    load();
  }, [load]);

  /**
   * API pública simple y predecible.
   * ✅ options: siempre array (vacío si error)
   * ✅ loading: spinner controlado
   */
  return { options, loading };
}

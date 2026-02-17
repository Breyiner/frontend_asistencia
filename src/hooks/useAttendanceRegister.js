import { useCallback, useEffect, useMemo, useState } from "react";  // Hooks esenciales para optimización
import { api } from "../services/apiClient";  // Cliente HTTP con auth, interceptors y retry
import { toDayLabels } from "../utils/dateUtils";  // Utilidad para generar etiquetas legibles de fechas

/**
 * Configuración de etiquetas para estados de asistencia en la UI.
 * 
 * Mapea códigos internos de estado → etiquetas visibles para el usuario.
 * Usado en tooltips, leyendas, filtros y resúmenes.
 * 
 * Estructura: { code: "internal_code", label: "Texto legible" }
 * 
 * @constant
 * @type {Object<string, {code: string, label: string}>}
 */
const STATUS_UI = {
  // Asistencia completa
  present: { code: "present", label: "Asistencia" },
  // Inasistencia total
  absent: { code: "absent", label: "Inasistencia" },
  // Llegó tarde
  late: { code: "late", label: "Tardanza" },
  // Ausencia con justificación
  excused_absence: { code: "excused_absence", label: "Justificada" },
  // Salió antes del final
  early_exit: { code: "early_exit", label: "Salida anticipada" },
  // No hay registro
  unregistered: { code: "unregistered", label: "Sin registrar" },
  // Día sin clases (feriado, etc.)
  no_class_day: { code: "no_class_day", label: "Sin clase" },
};

/**
 * Hook para el registro mensual de asistencias (matriz aprendices x clases).
 * 
 * [DESCRIPCIÓN COMPLETA EN EL BLOQUE JSDOC ARRIBA]
 */
export default function useAttendanceRegister(fichaId) {
  // Año del calendario mostrado (2026 por defecto)
  const [year, setYear] = useState(2026);
  
  // Mes del calendario mostrado (1=enero, 2=febrero, ..., 12=diciembre)
  const [month, setMonth] = useState(2);
  
  // Estado de carga inicial y recargas
  const [loading, setLoading] = useState(true);
  
  // Mensaje específico de error de la API
  const [error, setError] = useState("");
  
  // Payload crudo desde la API (estructura compleja)
  const [payload, setPayload] = useState(null);

  /**
   * Carga el registro mensual desde la API.
   * 
   * Endpoint: GET attendances/monthly_register?ficha_id=X&year=Y&month=Z
   * 
   * Proceso detallado:
   * 1. Activa loading
   * 2. Limpia error previo
   * 3. Construye URL con parámetros obligatorios
   * 4. GET con apiClient (incluye auth headers automáticamente)
   * 5. Si !res.ok: setea error y limpia payload
   * 6. Si éxito: guarda payload completo
   * 7. Siempre: desactiva loading
   * 
   * useCallback con [fichaId, year, month] → se recrea solo cuando cambian estos valores
   */
  const loadRegister = useCallback(async () => {
    // Activa indicador de carga
    setLoading(true);
    
    // Limpia errores de intentos anteriores
    setError("");

    // Construye URL con parámetros obligatorios
    // Los parámetros se incluyen como query string (?ficha_id=5&year=2026&month=2)
    const endpoint = `attendances/monthly_register?ficha_id=${fichaId}&year=${year}&month=${month}`;

    try {
      // api.get maneja auth, loading states, errores globales automáticamente
      const res = await api.get(endpoint);

      // Si la API responde !ok (4xx, 5xx): maneja como error específico
      if (!res.ok) {
        // Muestra mensaje específico de la API (ej: "Ficha no encontrada")
        setError(res.message || "Error cargando registro");
        // Limpia datos previos para evitar datos "fantasma"
        setPayload(null);
        return;
      }

      // Éxito: guarda el payload COMPLETO (muy pesado)
      setPayload(res.data);
    } catch (err) {
      // Error de red, timeout, CORS, etc.
      console.error("Error cargando registro:", err);
      setError("Error de conexión");
      // Limpia datos
      setPayload(null);
    } finally {
      // SIEMPRE desactiva loading (incluso en error)
      setLoading(false);
    }
  }, [fichaId, year, month]);  // Dependencias → recrea callback solo si cambian

  /**
   * Carga automática cuando cambian fichaId, año o mes.
   * 
   * useEffect con dependencia [loadRegister] → ejecuta cuando cambia el callback
   * (lo que ocurre cuando cambian fichaId/year/month)
   */
  useEffect(() => {
    loadRegister();
  }, [loadRegister]);

  /**
   * Recarga manual del registro.
   * 
   * Útil para:
   * - Botón "Recargar" después de editar asistencias
   * - Cambios en días sin clase que afecten el mes
   * - Debugging manual
   */
  const reload = () => loadRegister();

  /**
   * Exporta el registro a Excel.
   * 
   * [DETALLES COMPLETOS EN EL BLOQUE JSDOC ARRIBA]
   */
  const exportRegister = useCallback(async () => {
    // Endpoint específico para descarga de archivo
    const endpoint = `attendances/file/export?ficha_id=${fichaId}&year=${year}&month=${month}`;

    try {
      // api.downloadFile maneja descarga de blobs automáticamente
      const result = await api.downloadFile(endpoint);

      // Verifica que la descarga fue exitosa
      if (!result.ok || !result.blob) {
        throw new Error(result.message || "Error al exportar el registro");
      }

      // Genera nombre descriptivo del archivo
      const fileName = `Registro_Asistencias_Ficha${fichaId}_${year}-${String(month).padStart(2, "0")}.xlsx`;

      // Crea URL temporal del blob (no sube al servidor)
      const url = window.URL.createObjectURL(result.blob);
      
      // Crea elemento <a> temporal (no visible)
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;  // Nombre que se ve en el descargador
      document.body.appendChild(link);
      
      // Simula click para descargar
      link.click();
      
      // Limpieza: remueve el elemento y libera memoria
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true };  // Descarga exitosa
    } catch (err) {
      console.error("Error exportando:", err);
      return { success: false, error: err.message };
    }
  }, [fichaId, year, month]);  // Dependencias → recrea solo si cambian

  // Acceso rápido a partes del payload (evita data?.prop cada vez)
  const data = payload || null;
  const legend = data?.legend || {};  // Etiquetas personalizables de estados
  const summary = payload?.summary || {};  // Resumen mensual (totales, promedios)

  /**
   * Información detallada por fecha.
   * 
   * Estructura:
   * day_info_by_date["2026-02-16"] = {
   *   day_state: "no_class_day" | "normal",
   *   reason: { name: "Feriado nacional" } | null,
   *   observations: "Puente festivo",
   * }
   * 
   * Memoizado para evitar recálculo en cada render.
   */
  const dayInfoByDate = useMemo(() => {
    return data?.day_info_by_date || {};
  }, [data]);

  /**
   * Lista de días del mes con etiquetas legibles.
   * 
   * Transforma fechas ISO → objetos con:
   * - iso: "2026-02-16"
   * - dayNameShort: "Lun"
   * - dayNumber: 16
   * - etc. (según toDayLabels)
   * 
   * useMemo evita recálculo innecesario.
   */
  const days = useMemo(() => {
    const list = data?.days || [];  // Array de fechas ISO del mes
    // Mapea cada fecha → objeto enriquecido con etiquetas
    return list.map((iso) => ({ iso, ...toDayLabels(iso) }));
  }, [data]);

  /**
   * Franjas horarias del horario de la ficha.
   * 
   * Si no vienen en payload, usa valores por defecto.
   * 
   * Ejemplo: [{ code: "am", label: "Mañana" }, { code: "pm", label: "Tarde" }]
   */
  const slots = useMemo(() => {
    return (
      data?.slots || [  // Payload tiene slots personalizados por ficha
        { code: "am", label: "Mañana" },
        { code: "pm", label: "Tarde" },
      ]
    );
  }, [data]);

  /**
   * Columnas expandidas: **una columna por cada clase individual**.
   * 
   * Lógica clave:
   * 1. Para cada día del mes
   * 2. Para cada franja horaria
   * 3. Si hay N clases en esa (día, franja) → N columnas
   * 4. Mínimo 1 columna por (día, franja), incluso si no hay clases
   * 
   * Ejemplo:
   * - 2026-02-15, mañana: 2 clases → 2 columnas "Mañana"
   * - 2026-02-16, tarde: 0 clases → 1 columna "Tarde"
   * 
   * Esto permite headers como: | Mañana | Mañana | Tarde |
   */
  const columns = useMemo(() => {
    const src = data?.classes_by_date_slot || {};  // { "2026-02-15": { "am": [clase1, clase2] } }
    const cols = [];  // Array final de columnas

    // Itera todos los días del mes
    days.forEach((d) => {
      const slotsData = src?.[d.iso] || {};  // Slots para este día específico

      // Itera todas las franjas del día
      slots.forEach((s) => {
        // Array de clases en esta (día, franja)
        const classItems = Array.isArray(slotsData?.[s.code]) ? slotsData[s.code] : [];
        
        // Mínimo 1 columna, máximo = número de clases
        const count = Math.max(1, classItems.length);

        // Crea una columna por cada clase (o 1 si no hay clases)
        for (let i = 0; i < count; i++) {
          cols.push({
            dayIso: d.iso,               // "2026-02-15"
            slotCode: s.code,            // "am", "pm"
            slotLabel: s.label,          // "Mañana", "Tarde"
            index: i,                    // 0, 1, 2... (orden de la clase)
            classItem: classItems[i] || null,  // Datos de la clase #i (null si no existe)
          });
        }
      });
    });

    return cols;  // Array con TODAS las columnas del mes
  }, [data, days, slots]);  // Dependencias críticas

  /**
   * colSpan para cada día en el header superior.
   * 
   * Calcula cuántas columnas totales pertenecen a cada día:
   * - Suma columnas de todas las franjas
   * 
   * Ejemplo resultado:
   * dayColSpan.get("2026-02-15") === 3  // (2 mañana + 1 tarde)
   * 
   * Usado para headers tipo:
   * |      Lun 15      | Mar 16 |
   * |Mañ|Mañ|Tarde| ... |
   */
  const dayColSpan = useMemo(() => {
    const map = new Map();  // Map fecha → total columnas
    columns.forEach((c) => {
      // Incrementa contador para este día
      map.set(c.dayIso, (map.get(c.dayIso) || 0) + 1);
    });
    return map;
  }, [columns]);

  /**
   * Filas del registro: **un objeto por aprendiz**.
   * 
   * Transformación compleja:
   * 1. Para cada aprendiz del payload
   * 2. Para cada columna del mes
   * 3. Determina el estado de asistencia en esa celda específica
   * 4. Construye classInfo detallado para tooltips/modales
   * 
   * Clave: cada celda tiene su propia lógica de estado
   */
  const rows = useMemo(() => {
    const apprentices = data?.apprentices || [];  // Lista de aprendices de la ficha

    return apprentices.map((a) => {
      // marks_by_date_slot[date][slot] = array de marcas para ese día/slot
      const marksByDateSlot = a?.marks_by_date_slot || {};

      // Crea una celda por cada columna
      const cells = columns.map((col) => {
        // Estado del día completo (puede ser "no_class_day")
        const dayState = dayInfoByDate?.[col.dayIso]?.day_state;
        const isNoClassDay = dayState === "no_class_day";
        const dayReasonName = dayInfoByDate?.[col.dayIso]?.reason?.name || null;

        // Marcas de asistencia para este (día, slot)
        const markItemsRaw = marksByDateSlot?.[col.dayIso]?.[col.slotCode];
        const markItems = Array.isArray(markItemsRaw) ? markItemsRaw : [];
        
        // Marca específica para este índice de clase
        const mark = markItems[col.index] || null;

        // Determina código de estado final de la celda
        const statusCode = isNoClassDay
          ? "no_class_day"                    // Día sin clases
          : mark?.status || "unregistered";   // Estado de la marca o sin registrar

        // Objeto legible del estado
        const status = STATUS_UI[statusCode] || STATUS_UI.unregistered;

        // Clase correspondiente (puede ser null)
        const classItem = col.classItem;

        // Objeto RICH con toda la información para tooltips/modales
        const classInfo =
          classItem || isNoClassDay
            ? {
                // Fecha legible
                date: classItem?.display_date || classItem?.execution_date || col.dayIso,
                shift: col.slotLabel,  // "Mañana", "Tarde"
                // Horario real de la clase
                start: classItem?.real_time?.start_hour || "—",
                end: classItem?.real_time?.end_hour || "—",
                // Instructor asignado
                instructor: classItem?.instructor?.full_name || "—",
                // Tipo de clase (práctica, teórica, etc.)
                classType:
                  classItem?.class_type?.name || (isNoClassDay ? "Sin clase" : "—"),
                classroom: classItem?.classroom?.name || "—",
                // Etiqueta específica del estado de esta celda
                statusLabel: isNoClassDay
                  ? dayReasonName
                    ? `Sin clase (${dayReasonName})`
                    : legend?.no_class_day || "Sin clase"
                  : legend?.[statusCode] || status.label,
                // Horas ausentes calculadas
                absent_hours: isNoClassDay ? "—" : mark?.absent_hours || 0,
                // Observaciones consolidadas
                observations: isNoClassDay
                  ? dayInfoByDate?.[col.dayIso]?.observations || "—"
                  : mark?.observations || classItem?.observations || "—",
              }
            : null;  // Sin información de clase

        // Retorna celda completa
        return {
          colKey: `${col.dayIso}__${col.slotCode}__${col.index}`,  // Clave única para React
          dayIso: col.dayIso,
          shift: col.slotCode,
          status,  // {code, label}
          classInfo,  // Objeto rico para tooltips
        };
      });

      // Información del aprendiz para la fila
      const fullName = a?.full_name || `Aprendiz ${a?.id}`;
      return {
        apprentice: {
          id: a.id,
          name: fullName,
          // Genera iniciales para avatar circular
          // Ej: "Juan Pérez" → "JP", "Carlos" → "C"
          initials: (fullName || "?")
            .split(" ")
            .filter(Boolean)  // Remueve palabras vacías
            .slice(0, 2)      // Máximo 2 iniciales
            .map((x) => x[0]?.toUpperCase())  // Primera letra mayúscula
            .join(""),
        },
        cells,  // Array de celdas para este aprendiz
      };
    });
  }, [data, columns, dayInfoByDate, legend]);  // Dependencias pesadas → memoización crítica

  // Objeto público del hook
  return {
    payload,           // Datos crudos (debugging)
    loading,           // Spinner global
    error,             // Mensaje específico
    year, setYear,     // Navegación por años
    month, setMonth,   // Navegación por meses
    reload,            // Recarga manual
    exportRegister,    // Descarga Excel
    legend,            // Etiquetas de estados
    summary,           // Resumen mensual
    rows,              // FILAS del registro (1 por aprendiz)
    days,              // Días del mes con etiquetas
    slots,             // Franjas horarias
    columns,           // COLUMNAS expandidas (1 por clase)
    dayColSpan,        // Ancho de headers por día
  };
}

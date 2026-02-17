// Importa React y el hook useId para generar IDs únicos accesibles
import React, { useId } from "react";

// Importa componentes relacionados
import AttendanceMark from "../AttendanceMark/AttendanceMark"; // Marca visual del estado
import ClassTip from "../ClassTip/ClassTip";                   // Tooltip con info de la clase
import "./AttendanceTable.css";                                // Estilos de la tabla

/**
 * Componente envoltorio para cada celda de asistencia en la tabla.
 * 
 * Renderiza un botón con la marca de estado de asistencia y un tooltip opcional
 * que muestra información adicional de la clase cuando está disponible.
 * 
 * Usa useId para generar un ID único accesible que conecta el botón con su tooltip
 * mediante aria-describedby, mejorando la accesibilidad para lectores de pantalla.
 * 
 * @component
 * @private
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.cell - Objeto con datos de la celda de asistencia
 * @param {Object} [props.cell.status] - Estado de asistencia
 * @param {string} [props.cell.status.code] - Código del estado (present, absent, etc.)
 * @param {Object} [props.cell.classInfo] - Información adicional de la clase para tooltip
 * 
 * @returns {JSX.Element} Contenedor con botón de marca y tooltip opcional
 */
function AttendanceCellWrapper({ cell }) {
  
  // Genera un ID único para este componente específico
  // useId garantiza que sea único incluso si hay múltiples instancias del componente
  const tooltipId = useId();
  
  // Extrae el código del estado o usa "unregistered" como default
  const status = cell?.status?.code || "unregistered";
  
  // Determina si hay información de clase para mostrar en el tooltip
  // Convierte a booleano para evitar valores falsy que no sean false
  const hasInfo = Boolean(cell?.classInfo);

  return (
    // Contenedor de la celda
    <div className="att-cell">
      
      {/* Botón que muestra la marca de asistencia
          type="button" previene comportamiento de submit
          La clase incluye el estado para aplicar colores correspondientes
          aria-describedby conecta el botón con el tooltip para accesibilidad
          Solo se establece si hasInfo es true */}
      <button
        type="button"
        className={`att-cell__btn att-cell__btn--${status}`}
        aria-describedby={hasInfo ? tooltipId : undefined}
      >
        {/* Componente que renderiza la marca visual (✓, X, !, etc.) */}
        <AttendanceMark status={status} />
      </button>

      {/* Tooltip con información de la clase
          Solo se renderiza si hasInfo es true (renderizado condicional)
          El ID conecta con el aria-describedby del botón */}
      {hasInfo && <ClassTip id={tooltipId} info={cell.classInfo} />}
    </div>
  );
}

/**
 * Componente de tabla compleja para mostrar registros de asistencia.
 * 
 * Renderiza una tabla HTML semántica con:
 * - Cabecera multi-nivel: días en primera fila, franjas horarias en segunda fila
 * - Columna fija izquierda con nombres de aprendices
 * - Celdas de asistencia con estados visuales y tooltips
 * - Soporte para colspan dinámico por día
 * - Diseño responsive con scroll horizontal
 * 
 * Estructura de cabecera:
 * - Fila 1: Nombre "Aprendiz" + columnas de días con colspan
 * - Fila 2: Sub-columnas de franjas horarias por día
 * 
 * @component
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.rows - Array de filas, cada una representa un aprendiz
 * @param {Object} props.rows[].apprentice - Datos del aprendiz
 * @param {string} props.rows[].apprentice.id - ID único del aprendiz
 * @param {string} props.rows[].apprentice.name - Nombre completo
 * @param {string} props.rows[].apprentice.initials - Iniciales para avatar
 * @param {Array} props.rows[].cells - Array de celdas de asistencia del aprendiz
 * @param {Array} props.days - Array de días a mostrar en la cabecera
 * @param {string} props.days[].iso - Fecha en formato ISO (YYYY-MM-DD)
 * @param {string} props.days[].labelTop - Etiqueta superior del día (ej: "Lun")
 * @param {string} props.days[].labelBottom - Etiqueta inferior del día (ej: "15")
 * @param {Array} props.slots - Array de franjas horarias (slots)
 * @param {string} props.slots[].code - Código único del slot
 * @param {string} props.slots[].label - Etiqueta visible del slot
 * @param {Array} [props.columns] - Configuración personalizada de columnas (opcional)
 * @param {Map} [props.dayColSpan] - Map con colspan personalizado por día
 * 
 * @returns {JSX.Element} Tabla de asistencias con scroll horizontal
 * 
 * @example
 * <AttendanceTable
 *   rows={[
 *     {
 *       apprentice: { id: "1", name: "Juan Pérez", initials: "JP" },
 *       cells: [{ colKey: "2024-01-15-am", status: { code: "present" } }]
 *     }
 *   ]}
 *   days={[
 *     { iso: "2024-01-15", labelTop: "Lun", labelBottom: "15" }
 *   ]}
 *   slots={[
 *     { code: "am", label: "AM" },
 *     { code: "pm", label: "PM" }
 *   ]}
 * />
 */
export default function AttendanceTable({ rows, days, slots, columns, dayColSpan }) {
  return (
    // Contenedor wrapper para permitir scroll horizontal en tablas anchas
    <div className="att-table-wrap">
      
      {/* Tabla semántica con etiqueta aria para accesibilidad */}
      <table className="att-table" aria-label="Registro de asistencias">
        
        {/* Cabecera de la tabla con dos filas de encabezados */}
        <thead className="att-table__head">
          
          {/* Primera fila: nombre de columna de aprendiz + días */}
          <tr>
            {/* Celda fija izquierda que dice "Aprendiz"
                rowSpan={2} hace que ocupe las dos filas de la cabecera
                stickyLeft la mantiene fija al hacer scroll horizontal */}
            <th className="att-table__th att-table__th--stickyLeft" rowSpan={2}>
              Aprendiz
            </th>

            {/* Mapea cada día para crear una columna en la cabecera
                Cada columna de día tiene colspan según dayColSpan o número de slots */}
            {days.map((d) => (
              <th
                key={d.iso}
                className="att-table__th"
                // colspan dinámico: usa valor personalizado de dayColSpan o slots.length
                // ??: operador nullish coalescing (usa default si es null/undefined)
                colSpan={dayColSpan?.get(d.iso) ?? slots.length}
              >
                {/* Etiqueta superior del día (ej: "Lun", "Mar") */}
                <div className="att-table__dayTop">{d.labelTop}</div>
                
                {/* Etiqueta inferior del día (ej: "15", "16") */}
                <div className="att-table__dayBottom">{d.labelBottom}</div>
              </th>
            ))}
          </tr>

          {/* Segunda fila: sub-encabezados de franjas horarias (slots) */}
          <tr>
            {/* Genera las columnas de slots
                Si columns está definido y tiene elementos, usa columns
                Si no, genera columns combinando days y slots con flatMap */}
            {(columns && columns.length > 0
              ? columns // Usa configuración personalizada
              : // Genera configuración default: cada día × cada slot
                days.flatMap((d) =>
                  slots.map((s) => ({
                    dayIso: d.iso,      // Fecha del día
                    slotCode: s.code,   // Código del slot
                    slotLabel: s.label, // Etiqueta visible
                    index: 0,           // Índice para keys únicos
                  }))
                )
            ).map((c) => (
              // Celda de sub-encabezado para cada slot
              // Key único combinando día, slot e índice
              <th
                key={`${c.dayIso}-${c.slotCode}-${c.index}`}
                className="att-table__th att-table__th--sub"
              >
                {c.slotLabel}
              </th>
            ))}
          </tr>
        </thead>

        {/* Cuerpo de la tabla con las filas de aprendices */}
        <tbody>
          
          {/* Mapea cada fila (cada aprendiz) */}
          {rows.map((r) => (
            <tr key={r.apprentice.id}>
              
              {/* Primera celda: información del aprendiz (fija a la izquierda) */}
              <td className="att-table__td att-table__td--stickyLeft">
                <div className="att-table__apprentice">
                  
                  {/* Avatar con iniciales del aprendiz */}
                  <div className="avatar-chip">{r.apprentice.initials}</div>
                  
                  {/* Nombre completo del aprendiz */}
                  <div className="att-table__apprenticeName">
                    {r.apprentice.name}
                  </div>
                </div>
              </td>

              {/* Mapea cada celda de asistencia del aprendiz
                  Una celda por cada combinación día-slot */}
              {r.cells.map((cell) => (
                <td
                  // Key único combinando ID del aprendiz y clave de la columna
                  key={`${r.apprentice.id}-${cell.colKey}`}
                  className="att-table__td"
                >
                  {/* Renderiza el componente envoltorio de la celda
                      Contiene la marca de asistencia y tooltip */}
                  <AttendanceCellWrapper cell={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
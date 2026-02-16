// Importa React (necesario para JSX)
import React from "react";

// Importa estilos de la tabla de aprendices en riesgo
import "./RiskApprenticesTable.css";

// Importa componente Pill para mostrar badges de números
import Pill from "../Pill/Pill";

// Importa utilidad de formateo de números
import { num } from "../../utils/attendanceMappers";

/**
 * Componente de tabla para mostrar aprendices en riesgo de deserción.
 * 
 * Muestra aprendices que cumplen criterios de riesgo:
 * - 3 o más días consecutivos de ausencia (badge rojo)
 * - 5 o más días totales de ausencia intermitente (badge amarillo)
 * 
 * Características:
 * - Header con título, subtítulo y leyenda de pills
 * - Tabla con información detallada de cada aprendiz
 * - Lista de fechas de ausencias (con límite de 10)
 * - Estado vacío cuando no hay datos o no hay ficha seleccionada
 * 
 * Solo muestra datos cuando hay una ficha específica seleccionada
 * (el análisis de riesgo es por ficha/trimestre).
 * 
 * @component
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array<Object>} props.rows - Array de aprendices en riesgo
 * @param {number} props.rows[].apprentice_id - ID del aprendiz
 * @param {string} props.rows[].name - Nombre completo del aprendiz
 * @param {string} props.rows[].document_number - Número de documento
 * @param {number} props.rows[].max_consecutive_absent_days - Días consecutivos ausente
 * @param {number} props.rows[].total_absent_days - Total de días ausente
 * @param {Array<string>} props.rows[].absence_dates_in_current_term - Fechas de ausencias
 * 
 * @returns {JSX.Element} Tabla con aprendices en riesgo
 * 
 * @example
 * <RiskApprenticesTable
 *   rows={[
 *     {
 *       apprentice_id: 123,
 *       name: "Juan Pérez",
 *       document_number: "1234567890",
 *       max_consecutive_absent_days: 4,
 *       total_absent_days: 6,
 *       absence_dates_in_current_term: ["2024-01-15", "2024-01-16", "2024-01-17", "2024-01-18"]
 *     }
 *   ]}
 * />
 */
export default function RiskApprenticesTable({ rows }) {
  
  // Determina si hay filas de datos
  const hasRows = (rows || []).length > 0;

  return (
    // Contenedor principal con clase de tabla de dashboard
    <div className="dash-table">
      
      {/* Header de la tabla con título, subtítulo y leyenda */}
      <div className="dash-table__header dash-risk__header">
        
        {/* Lado izquierdo: título y subtítulo */}
        <div>
          {/* Título principal */}
          <div className="dash-table__title">
            Aprendices próximos a deserción (trimestre actual)
          </div>
          
          {/* Subtítulo explicativo */}
          <div className="dash-table__subtitle">
            Solo aparece con ficha seleccionada. Regla fija: 3 consecutivos o 5 totales.
          </div>
        </div>

        {/* Lado derecho: leyenda de pills */}
        <div className="dash-risk__legend">
          {/* Pill rojo: criterio de 3+ días consecutivos */}
          <Pill variant="danger">3+ consecutivos</Pill>
          
          {/* Pill amarillo: criterio de 5+ días intermitentes */}
          <Pill variant="warning">5+ intermitentes</Pill>
        </div>
      </div>

      {/* Tabla HTML semántica */}
      <table className="dash-table__table">
        
        {/* Cabecera de la tabla */}
        <thead>
          <tr>
            <th>Aprendiz</th>
            <th>Documento</th>
            <th>Días consecutivos</th>
            <th>Días totales</th>
            <th>Fechas (trimestre)</th>
          </tr>
        </thead>
        
        {/* Cuerpo de la tabla */}
        <tbody>
          
          {/* Caso 1: No hay datos - mensaje vacío */}
          {!hasRows ? (
            <tr>
              {/* Celda que abarca todas las columnas (colSpan) */}
              <td colSpan={5} className="dash-table__empty">
                No hay aprendices en riesgo (o no hay ficha seleccionada).
              </td>
            </tr>
          ) : (
            /* Caso 2: Hay datos - mapea cada aprendiz en riesgo */
            rows.map((r) => (
              <tr key={r.apprentice_id}>
                
                {/* Nombre del aprendiz */}
                <td>{r.name}</td>
                
                {/* Documento - muestra "—" si es null */}
                <td>{r.document_number ?? "—"}</td>
                
                {/* Días consecutivos ausente - Pill rojo (danger) */}
                <td>
                  <Pill variant="danger">
                    {/* Formatea el número con separadores de miles */}
                    {num(r.max_consecutive_absent_days)}
                  </Pill>
                </td>
                
                {/* Total de días ausente - Pill amarillo (warning) */}
                <td>
                  <Pill variant="warning">
                    {num(r.total_absent_days)}
                  </Pill>
                </td>
                
                {/* Lista de fechas de ausencias */}
                <td className="dash-risk__dates">
                  {/* Verifica si hay fechas en el array */}
                  {(r.absence_dates_in_current_term || []).length
                    ? (
                        // Muestra máximo 10 fechas, separadas por comas
                        // Si hay más de 10, agrega "..."
                        (r.absence_dates_in_current_term || []).slice(0, 10).join(", ") +
                        ((r.absence_dates_in_current_term || []).length > 10 ? "..." : "")
                      )
                    : "—" // Si no hay fechas, muestra guión
                  }
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
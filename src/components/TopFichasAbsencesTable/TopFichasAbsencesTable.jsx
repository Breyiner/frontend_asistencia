import React from "react";
import "./TopFichasAbsencesTable.css";
import Pill from "../Pill/Pill";
import { num } from "../../utils/attendanceMappers";

/**
 * Componente de tabla para mostrar fichas con más inasistencias.
 * 
 * Renderiza una tabla de dashboard que muestra un ranking de fichas
 * ordenadas por número de inasistencias dentro de un rango de fechas.
 * Útil para identificar fichas que requieren atención especial.
 * 
 * Características:
 * - Tabla responsive con encabezados
 * - Estado vacío cuando no hay datos para los filtros
 * - Formato numérico de conteo de ausencias
 * - Pills con colores para destacar métricas
 * - Título y subtítulo descriptivos
 * 
 * @component
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array<Object>} [props.rows] - Array de filas con datos de fichas
 * @param {number} props.rows[].ficha_id - ID único de la ficha
 * @param {string} props.rows[].ficha_number - Número identificador de la ficha
 * @param {string} props.rows[].training_program_name - Nombre del programa de formación
 * @param {number} props.rows[].absences - Cantidad de inasistencias registradas
 * 
 * @returns {JSX.Element} Tabla de ranking de fichas con inasistencias
 * 
 * @example
 * <TopFichasAbsencesTable
 *   rows={[
 *     {
 *       ficha_id: 1,
 *       ficha_number: "2461467",
 *       training_program_name: "Análisis y Desarrollo de Software",
 *       absences: 45
 *     },
 *     {
 *       ficha_id: 2,
 *       ficha_number: "2461468",
 *       training_program_name: "Diseño Gráfico",
 *       absences: 32
 *     },
 *     {
 *       ficha_id: 3,
 *       ficha_number: "2461469",
 *       training_program_name: "Contabilidad",
 *       absences: 28
 *     }
 *   ]}
 * />
 * 
 * @example
 * // Sin datos (estado vacío)
 * <TopFichasAbsencesTable rows={[]} />
 */
export default function TopFichasAbsencesTable({ rows }) {
  // Verifica si hay filas para mostrar
  // (rows || []) asegura que siempre sea un array, incluso si rows es null/undefined
  const hasRows = (rows || []).length > 0;

  return (
    <div className="dash-table">
      {/* Encabezado de la tabla */}
      <div className="dash-table__header">
        <div>
          {/* Título principal */}
          <div className="dash-table__title">Top fichas con inasistencias (rango)</div>
          {/* Subtítulo explicativo - aclara que está ordenado y filtrado por rango */}
          <div className="dash-table__subtitle">
            Ordenado por conteo de ausencias dentro del rango seleccionado.
          </div>
        </div>
      </div>

      {/* Tabla HTML estándar */}
      <table className="dash-table__table">
        <thead>
          <tr>
            <th>Ficha</th>
            <th>Programa</th>
            <th>Inasistencias</th>
          </tr>
        </thead>
        <tbody>
          {/* Renderizado condicional: estado vacío vs filas con datos */}
          {!hasRows ? (
            // Estado vacío - muestra mensaje cuando no hay datos
            <tr>
              {/* colSpan={3}: la celda ocupa las 3 columnas de la tabla */}
              <td colSpan={3} className="dash-table__empty">
                Sin datos para los filtros actuales.
              </td>
            </tr>
          ) : (
            // Mapea las filas cuando hay datos
            // key={r.ficha_id}: usa el ID de la ficha como key única
            rows.map((r) => (
              <tr key={r.ficha_id}>
                {/* Columna: número de ficha */}
                <td>{r.ficha_number}</td>
                {/* Columna: nombre del programa de formación */}
                <td>{r.training_program_name}</td>
                {/* Columna: cantidad de inasistencias en un Pill rojo */}
                <td>
                  {/* num() es una función helper que formatea el número
                      (probablemente añade separadores de miles) */}
                  <Pill variant="danger">{num(r.absences)}</Pill>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

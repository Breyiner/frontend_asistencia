// Importa estilos de la tabla de datos
import "./DataTable.css";

/**
 * Componente de tabla de datos reutilizable.
 * 
 * Renderiza una tabla HTML con:
 * - Cabecera con columnas configurables
 * - Filas con datos configurables
 * - Estados de carga y vacío
 * - Filas clickeables opcionales
 * - Renderizado personalizado por columna
 * 
 * Soporta tres estados:
 * 1. Loading: Muestra mensaje de carga
 * 2. Empty: Muestra mensaje cuando no hay datos
 * 3. Data: Muestra la tabla con datos
 * 
 * Cada columna puede tener:
 * - render: función personalizada para renderizar el contenido
 * - className: clases CSS para la celda
 * - headerClassName: clases CSS para el encabezado
 * 
 * @component
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.data - Array de objetos con los datos a mostrar
 * @param {Array} props.columns - Configuración de columnas
 * @param {string} props.columns[].key - Clave del campo en el objeto de datos
 * @param {string} props.columns[].label - Etiqueta visible en el encabezado
 * @param {Function} [props.columns[].render] - Función para renderizar contenido personalizado
 * @param {string} [props.columns[].className] - Clases CSS para celdas de datos
 * @param {string} [props.columns[].headerClassName] - Clases CSS para celda de encabezado
 * @param {boolean} props.loading - Indica si los datos están cargando
 * @param {Function} [props.onRowClick] - Callback ejecutado al hacer click en una fila
 * 
 * @returns {JSX.Element} Tabla o mensaje de estado
 * 
 * @example
 * // Tabla simple
 * <DataTable
 *   data={apprentices}
 *   columns={[
 *     { key: "name", label: "Nombre" },
 *     { key: "email", label: "Email" }
 *   ]}
 *   loading={false}
 * />
 * 
 * @example
 * // Tabla con columnas personalizadas y filas clickeables
 * <DataTable
 *   data={users}
 *   columns={[
 *     { 
 *       key: "name", 
 *       label: "Nombre Completo",
 *       render: (row) => `${row.first_name} ${row.last_name}`
 *     },
 *     { 
 *       key: "status", 
 *       label: "Estado",
 *       render: (row) => <Badge>{row.status}</Badge>,
 *       className: "text-center"
 *     }
 *   ]}
 *   loading={false}
 *   onRowClick={(row) => navigate(`/users/${row.id}`)}
 * />
 */
export default function DataTable({ data, columns, loading, onRowClick }) {
  
  // Estado de carga: muestra mensaje mientras se obtienen los datos
  if (loading) {
    return (
      <div className="data-table data-table--loading">
        Cargando información...
      </div>
    );
  }

  // Estado vacío: muestra mensaje cuando no hay datos para mostrar
  if (!data || data.length === 0) {
    return (
      <div className="data-table data-table--empty">
        No hay registros para mostrar.
      </div>
    );
  }

  // Determina si las filas son clickeables
  // Solo si onRowClick es una función válida
  const isClickable = typeof onRowClick === "function";

  return (
    // Contenedor de la tabla
    <div className="data-table">
      
      {/* Tabla HTML semántica */}
      <table>
        
        {/* Cabecera de la tabla */}
        <thead>
          <tr>
            {/* Mapea cada columna para crear los encabezados
                key: identificador único de la columna
                headerClassName: clases CSS opcionales para personalizar estilo */}
            {columns.map((col) => (
              <th key={col.key} className={col.headerClassName || ""}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        {/* Cuerpo de la tabla con los datos */}
        <tbody>
          
          {/* Mapea cada fila de datos
              key: usa row.id si existe, sino usa el índice (menos óptimo) */}
          {data.map((row, index) => (
            <tr
              key={row.id || index}
              // Clase dinámica: agrega --clickable si onRowClick existe
              className={isClickable ? "data-table__row data-table__row--clickable" : "data-table__row"}
              // Click handler: solo se asigna si isClickable es true
              onClick={isClickable ? () => onRowClick(row) : undefined}
              // Atributos de accesibilidad para filas clickeables
              role={isClickable ? "button" : undefined}
              tabIndex={isClickable ? 0 : undefined} // Permite navegación con teclado
            >
              {/* Mapea cada columna para crear las celdas de la fila */}
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={col.className || ""}
                >
                  {/* Renderiza el contenido de la celda:
                      - Si col.render es función: usa renderizado personalizado
                      - Si no: muestra el valor directo de row[col.key] */}
                  {typeof col.render === "function" ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
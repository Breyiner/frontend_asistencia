import "./DataTable.css";

export default function DataTable({ data, columns, loading }) {
  if (loading) {
    return (
      <div className="data-table data-table--loading">
        Cargando información...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="data-table data-table--empty">
        No hay registros para mostrar.
      </div>
    );
  }

  return (
    <div className="data-table">
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={col.headerClassName || ""}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={row.id || index}>
              {columns.map((col) => (
                <td key={col.key} className={col.className || ""}>
                  {typeof col.render === "function"
                    ? col.render(row)
                    : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
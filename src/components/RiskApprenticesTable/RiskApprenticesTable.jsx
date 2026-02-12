import React from "react";
import "./RiskApprenticesTable.css";
import Pill from "../Pill/Pill";
import { num } from "../../utils/attendanceMappers";

export default function RiskApprenticesTable({ rows }) {
  const hasRows = (rows || []).length > 0;

  return (
    <div className="dash-table">
      <div className="dash-table__header dash-risk__header">
        <div>
          <div className="dash-table__title">
            Aprendices próximos a deserción (trimestre actual)
          </div>
          <div className="dash-table__subtitle">
            Solo aparece con ficha seleccionada. Regla fija: 3 consecutivos o 5 totales.
          </div>
        </div>

        <div className="dash-risk__legend">
          <Pill variant="danger">3+ consecutivos</Pill>
          <Pill variant="warning">5+ intermitentes</Pill>
        </div>
      </div>

      <table className="dash-table__table">
        <thead>
          <tr>
            <th>Aprendiz</th>
            <th>Documento</th>
            <th>Días consecutivos</th>
            <th>Días totales</th>
            <th>Fechas (trimestre)</th>
          </tr>
        </thead>
        <tbody>
          {!hasRows ? (
            <tr>
              <td colSpan={5} className="dash-table__empty">
                No hay aprendices en riesgo (o no hay ficha seleccionada).
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={r.apprentice_id}>
                <td>{r.name}</td>
                <td>{r.document_number ?? "—"}</td>
                <td>
                  <Pill variant="danger">{num(r.max_consecutive_absent_days)}</Pill>
                </td>
                <td>
                  <Pill variant="warning">{num(r.total_absent_days)}</Pill>
                </td>
                <td className="dash-risk__dates">
                  {(r.absence_dates_in_current_term || []).length
                    ? (r.absence_dates_in_current_term || []).slice(0, 10).join(", ") +
                      ((r.absence_dates_in_current_term || []).length > 10 ? "..." : "")
                    : "—"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

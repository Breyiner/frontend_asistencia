import React from "react";
import "./TopFichasAbsencesTable.css";
import Pill from "../Pill/Pill";
import { num } from "../../utils/attendanceMappers";

export default function TopFichasAbsencesTable({ rows }) {
  const hasRows = (rows || []).length > 0;

  return (
    <div className="dash-table">
      <div className="dash-table__header">
        <div>
          <div className="dash-table__title">Top fichas con inasistencias (rango)</div>
          <div className="dash-table__subtitle">
            Ordenado por conteo de ausencias dentro del rango seleccionado.
          </div>
        </div>
      </div>

      <table className="dash-table__table">
        <thead>
          <tr>
            <th>Ficha</th>
            <th>Programa</th>
            <th>Inasistencias</th>
          </tr>
        </thead>
        <tbody>
          {!hasRows ? (
            <tr>
              <td colSpan={3} className="dash-table__empty">
                Sin datos para los filtros actuales.
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={r.ficha_id}>
                <td>{r.ficha_number}</td>
                <td>{r.training_program_name}</td>
                <td>
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

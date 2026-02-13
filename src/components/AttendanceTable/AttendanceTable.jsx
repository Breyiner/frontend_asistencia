import React, { useId } from "react";
import AttendanceMark from "../AttendanceMark/AttendanceMark";
import ClassTip from "../ClassTip/ClassTip";  // Componente separado
import "./AttendanceTable.css";

function AttendanceCellWrapper({ cell }) {
  const tooltipId = useId();
  const status = cell?.status?.code || "unregistered";
  const hasInfo = Boolean(cell?.classInfo);

  return (
    <div className="att-cell">
      <button
        type="button"
        className={`att-cell__btn att-cell__btn--${status}`}
        aria-describedby={hasInfo ? tooltipId : undefined}
      >
        <AttendanceMark status={status} />
      </button>
      
      {hasInfo && <ClassTip id={tooltipId} info={cell.classInfo} />}
    </div>
  );
}

export default function AttendanceTable({ rows, days, slots }) {
  return (
    <div className="att-table-wrap">
      <table className="att-table" aria-label="Registro de asistencias">
        <thead className="att-table__head">
          <tr>
            <th className="att-table__th att-table__th--stickyLeft" rowSpan={2}>
              Aprendiz
            </th>
            {days.map((d) => (
              <th key={d.iso} className="att-table__th" colSpan={slots.length}>
                <div className="att-table__dayTop">{d.labelTop}</div>
                <div className="att-table__dayBottom">{d.labelBottom}</div>
              </th>
            ))}
          </tr>
          <tr>
            {days.map((d) =>
              slots.map((s) => (
                <th key={`${d.iso}-${s.code}`} className="att-table__th att-table__th--sub">
                  {s.label}
                </th>
              ))
            )}
          </tr>
        </thead>

        <tbody>
          {rows.map((r) => {
            const byKey = new Map();
            r.cells.forEach((c) => byKey.set(`${c.dayIso}__${c.shift}`, c));

            return (
              <tr key={r.apprentice.id}>
                <td className="att-table__td att-table__td--stickyLeft">
                  <div className="att-table__apprentice">
                    <div className="avatar-chip">{r.apprentice.initials}</div>
                    <div className="att-table__apprenticeName">{r.apprentice.name}</div>
                  </div>
                </td>
                {days.map((d) =>
                  slots.map((s) => (
                    <td key={`${r.apprentice.id}-${d.iso}-${s.code}`} className="att-table__td">
                      <AttendanceCellWrapper cell={byKey.get(`${d.iso}__${s.code}`)} />
                    </td>
                  ))
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
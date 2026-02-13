import React, { useId } from "react";
import AttendanceMark from "../AttendanceMark/AttendanceMark";
import ClassTip from "../ClassTip/ClassTip";
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

export default function AttendanceTable({ rows, days, slots, columns, dayColSpan }) {
  return (
    <div className="att-table-wrap">
      <table className="att-table" aria-label="Registro de asistencias">
        <thead className="att-table__head">
          <tr>
            <th className="att-table__th att-table__th--stickyLeft" rowSpan={2}>
              Aprendiz
            </th>

            {days.map((d) => (
              <th
                key={d.iso}
                className="att-table__th"
                colSpan={dayColSpan?.get(d.iso) ?? slots.length}
              >
                <div className="att-table__dayTop">{d.labelTop}</div>
                <div className="att-table__dayBottom">{d.labelBottom}</div>
              </th>
            ))}
          </tr>

          <tr>
            {(columns && columns.length > 0
              ? columns
              : days.flatMap((d) =>
                  slots.map((s) => ({
                    dayIso: d.iso,
                    slotCode: s.code,
                    slotLabel: s.label,
                    index: 0,
                  }))
                )
            ).map((c) => (
              <th
                key={`${c.dayIso}-${c.slotCode}-${c.index}`}
                className="att-table__th att-table__th--sub"
              >
                {c.slotLabel}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((r) => (
            <tr key={r.apprentice.id}>
              <td className="att-table__td att-table__td--stickyLeft">
                <div className="att-table__apprentice">
                  <div className="avatar-chip">{r.apprentice.initials}</div>
                  <div className="att-table__apprenticeName">
                    {r.apprentice.name}
                  </div>
                </div>
              </td>

              {r.cells.map((cell) => (
                <td
                  key={`${r.apprentice.id}-${cell.colKey}`}
                  className="att-table__td"
                >
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

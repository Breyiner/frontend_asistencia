import React, { useId, useMemo, useState } from "react";
import "./AttendanceRegisterStaticPage.css";

const STATUS = {
  present: { code: "present", label: "Asistencia" },
  absent: { code: "absent", label: "Inasistencia" },
  late: { code: "late", label: "Tardanza" },
  excused: { code: "excused", label: "Justificada" },
  unregistered: { code: "unregistered", label: "Sin registrar" },
};

function buildDays(baseDateStr, viewMode) {
  const count = viewMode === "day" ? 1 : viewMode === "month" ? 14 : 7;
  const base = new Date(baseDateStr + "T00:00:00");

  const days = [];
  for (let i = 0; i < count; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);

    const iso = d.toISOString().slice(0, 10);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");

    const dow = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"][d.getDay()];
    days.push({
      iso,
      labelTop: dow,
      labelBottom: `${dd}/${mm}`,
    });
  }
  return days;
}

function makeCell({ dayIso, shift, status, instructor, subject, obs }) {
  return {
    dayIso,
    shift, // "am" | "pm"
    status, // STATUS.*
    classInfo: {
      date: dayIso,
      shift: shift === "am" ? "Mañana" : "Tarde",
      instructor,
      subject,
      statusLabel: status.label,
      observations: obs || "—",
      start: shift === "am" ? "06:30" : "12:30",
      end: shift === "am" ? "12:00" : "18:00",
    },
  };
}

function buildRows(days) {
  const apprentices = [
    { id: 1, name: "Breyner Alexis Acosta Sandoval", initials: "BA" },
    { id: 2, name: "Karen Juliana Pardo", initials: "KJ" },
    { id: 3, name: "Juan David Rojas", initials: "JR" },
    { id: 4, name: "María Fernanda Gómez", initials: "MG" },
    { id: 5, name: "Andrés Felipe Torres", initials: "AT" },
  ];

  const instructors = ["Ing. Camila Díaz", "Ing. Javier Pérez", "Ing. Laura Ruiz"];
  const subjects = ["React", "Laravel", "Bases de Datos", "Testing"];

  return apprentices.map((a, idx) => {
    const cells = [];

    days.forEach((day, i) => {
      const pick = (idx + i) % 6;

      let amStatus = STATUS.unregistered;
      if (pick === 0) amStatus = STATUS.present;
      if (pick === 1) amStatus = STATUS.absent;
      if (pick === 2) amStatus = STATUS.late;
      if (pick === 3) amStatus = STATUS.excused;

      let pmStatus = STATUS.unregistered;
      if (pick === 4) pmStatus = STATUS.present;
      if (pick === 5) pmStatus = STATUS.absent;

      cells.push(
        makeCell({
          dayIso: day.iso,
          shift: "am",
          status: amStatus,
          instructor: instructors[(idx + i) % instructors.length],
          subject: subjects[(idx + 2 * i) % subjects.length],
          obs: amStatus.code === "absent" ? "No asistió a la sesión." : "",
        })
      );

      cells.push(
        makeCell({
          dayIso: day.iso,
          shift: "pm",
          status: pmStatus,
          instructor: instructors[(idx + i + 1) % instructors.length],
          subject: subjects[(idx + i + 1) % subjects.length],
          obs: pmStatus.code === "absent" ? "No asistió a la sesión." : "",
        })
      );
    });

    return { apprentice: a, cells };
  });
}

function calcSummary(rows) {
  const totalApprentices = (rows || []).length;
  let absences = 0;
  let presences = 0;

  (rows || []).forEach((r) => {
    (r.cells || []).forEach((c) => {
      if (c.status.code === "absent") absences += 1;
      if (c.status.code === "present") presences += 1;
    });
  });

  return { totalApprentices, absences, presences };
}

function AttendanceMark({ status, size = "md" }) {
  const cls = `mark mark--${status} mark--${size}`;
  const glyph =
    status === "present" ? "✓" :
    status === "absent" ? "×" :
    status === "late" ? "L" :
    status === "excused" ? "!" :
    status === "unregistered" ? "" : "";

  return (
    <span className={cls} aria-hidden="true">
      {glyph}
    </span>
  );
}

function Tooltip({ id, info }) {
  return (
    <div className="class-tip" id={id} role="tooltip">
      <div className="class-tip__title">{info.subject}</div>

      <div className="class-tip__grid">
        <div className="class-tip__label">Fecha</div>
        <div className="class-tip__value">{info.date}</div>

        <div className="class-tip__label">Jornada</div>
        <div className="class-tip__value">{info.shift}</div>

        <div className="class-tip__label">Hora</div>
        <div className="class-tip__value">
          {info.start} - {info.end}
        </div>

        <div className="class-tip__label">Instructor</div>
        <div className="class-tip__value">{info.instructor}</div>

        <div className="class-tip__label">Estado</div>
        <div className="class-tip__value">{info.statusLabel}</div>

        <div className="class-tip__label">Obs.</div>
        <div className="class-tip__value">{info.observations}</div>
      </div>
    </div>
  );
}

function AttendanceCell({ cell }) {
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

      {hasInfo ? <Tooltip id={tooltipId} info={cell.classInfo} /> : null}
    </div>
  );
}

export default function AttendanceRegisterStaticPage() {
  const [viewMode, setViewMode] = useState("week"); // day | week | month (solo UI)
  const [baseDate, setBaseDate] = useState("2025-04-01");

  const days = useMemo(() => buildDays(baseDate, viewMode), [baseDate, viewMode]);
  const rows = useMemo(() => buildRows(days), [days]);
  const summary = useMemo(() => calcSummary(rows), [rows]);

  return (
    <div className="att-reg">
      <div className="att-reg__top">
        <div className="att-reg__topLeft">
          <div className="view-head">
            <button className="view-head__back" type="button" onClick={() => window.history.back()}>
              ← Volver a la lista
            </button>

            <div className="view-head__card">
              <div className="view-head__title">Registro de Asistencias</div>
              <div className="view-head__subtitle">
                Análisis y Desarrollo de Software - Ficha 2894667
              </div>
            </div>
          </div>

          <div className="view-toolbar">
            <div className="view-toolbar__tabs" role="group" aria-label="Vista">
              <button
                type="button"
                className={`view-toolbar__tab ${viewMode === "day" ? "view-toolbar__tab--active" : ""}`}
                onClick={() => setViewMode("day")}
              >
                Día
              </button>
              <button
                type="button"
                className={`view-toolbar__tab ${viewMode === "week" ? "view-toolbar__tab--active" : ""}`}
                onClick={() => setViewMode("week")}
              >
                Semana
              </button>
              <button
                type="button"
                className={`view-toolbar__tab ${viewMode === "month" ? "view-toolbar__tab--active" : ""}`}
                onClick={() => setViewMode("month")}
              >
                Mes
              </button>
            </div>

            <div className="view-toolbar__dateNav">
              <button type="button" className="view-toolbar__navBtn" aria-label="Anterior">
                ‹
              </button>

              <label className="view-toolbar__dateWrap">
                <input
                  className="view-toolbar__date"
                  type="date"
                  value={baseDate}
                  onChange={(e) => setBaseDate(e.target.value)}
                />
              </label>

              <button type="button" className="view-toolbar__navBtn" aria-label="Siguiente">
                ›
              </button>
            </div>
          </div>
        </div>

        <div className="att-reg__topRight">
          <div className="sum-card">
            <div className="sum-card__head">
              <div className="sum-card__title">Resumen:</div>

              <div className="att-legend" aria-label="Leyenda de iconos">
                <div className="att-legend__item">
                  <AttendanceMark status="present" size="sm" />
                  <span>Asistencia</span>
                </div>
                <div className="att-legend__item">
                  <AttendanceMark status="absent" size="sm" />
                  <span>Inasistencia</span>
                </div>
                <div className="att-legend__item">
                  <AttendanceMark status="late" size="sm" />
                  <span>Tardanza</span>
                </div>
                <div className="att-legend__item">
                  <AttendanceMark status="excused" size="sm" />
                  <span>Justificada</span>
                </div>
                <div className="att-legend__item">
                  <AttendanceMark status="unregistered" size="sm" />
                  <span>Sin registrar</span>
                </div>
              </div>
            </div>

            <div className="sum-card__rows">
              <div className="sum-card__row">
                <span>Total Aprendices:</span>
                <strong>{summary.totalApprentices}</strong>
              </div>
              <div className="sum-card__row">
                <span>Ausencias:</span>
                <strong>{summary.absences}</strong>
              </div>
              <div className="sum-card__row">
                <span>Asistencias:</span>
                <strong>{summary.presences}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="att-reg__sectionTitle">Lista de Aprendices</div>

      <div className="att-tableWrap">
        <table className="att-table" aria-label="Registro de asistencias">
          <thead className="att-table__head">
            <tr>
              <th className="att-table__th att-table__th--stickyLeft" rowSpan={2}>
                Aprendiz
              </th>

              {days.map((d) => (
                <th key={d.iso} className="att-table__th" colSpan={2}>
                  <div className="att-table__dayTop">{d.labelTop}</div>
                  <div className="att-table__dayBottom">{d.labelBottom}</div>
                </th>
              ))}
            </tr>

            <tr>
              {days.map((d) => (
                <th key={d.iso + "-am"} className="att-table__th att-table__th--sub">
                  Mañana
                </th>
              ))}
              {days.map((d) => (
                <th key={d.iso + "-pm"} className="att-table__th att-table__th--sub">
                  Tarde
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => {
              const byDay = new Map();
              (r.cells || []).forEach((c) => byDay.set(`${c.dayIso}__${c.shift}`, c));

              return (
                <tr key={r.apprentice.id}>
                  <td className="att-table__td att-table__td--stickyLeft">
                    <div className="att-table__apprentice">
                      <div className="avatar-chip">{r.apprentice.initials}</div>
                      <div className="att-table__apprenticeName">{r.apprentice.name}</div>
                    </div>
                  </td>

                  {days.map((d) => (
                    <td key={r.apprentice.id + d.iso + "am"} className="att-table__td">
                      <AttendanceCell cell={byDay.get(`${d.iso}__am`)} />
                    </td>
                  ))}

                  {days.map((d) => (
                    <td key={r.apprentice.id + d.iso + "pm"} className="att-table__td">
                      <AttendanceCell cell={byDay.get(`${d.iso}__pm`)} />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

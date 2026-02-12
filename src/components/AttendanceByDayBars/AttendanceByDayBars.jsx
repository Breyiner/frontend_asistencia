import React, { useMemo } from "react";
import "./AttendanceByDayBars.css";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import { COLORS, calcRangeDays, mapBarsByDay, num } from "../../utils/attendanceMappers";

export default function AttendanceByDayBars({ barsByDay, rangeFrom, rangeTo }) {
  const rangeDays = useMemo(() => calcRangeDays(rangeFrom, rangeTo), [rangeFrom, rangeTo]);
  const barLabelKey = useMemo(() => (rangeDays > 16 ? "mmdd" : "dd"), [rangeDays]);

  const data = useMemo(() => mapBarsByDay(barsByDay), [barsByDay]);

  return (
    <div className="panel panel--span6">
      <h3 className="panel__title">Asistencias por Día</h3>
      <p className="panel__hint">
        Verde = presentes, rojo = ausentes. Etiqueta: {barLabelKey === "mmdd" ? "MM-DD" : "DD"}.
      </p>

      <div className="panel__chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={barLabelKey} />
            <YAxis />
            <Tooltip
              formatter={(v, name) => [num(v), name === "present" ? "Asistencias" : "Inasistencias"]}
            />
            <Legend
              formatter={(value) => (value === "present" ? "Asistencias" : "Inasistencias")}
            />
            <Bar dataKey="present" fill={COLORS.present} radius={[8, 8, 0, 0]} />
            <Bar dataKey="absent" fill={COLORS.absent} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

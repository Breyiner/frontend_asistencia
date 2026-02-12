import React, { useMemo } from "react";
import "./AttendanceStatusPie.css";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

import Pill from "../Pill/Pill";
import { mapPieData, num } from "../../utils/attendanceMappers";

export default function AttendanceStatusPie({ pieStatus }) {
  const pieData = useMemo(() => mapPieData(pieStatus), [pieStatus]);

  const unregisteredPct = useMemo(() => {
    const row = (pieStatus || []).find((x) => x.code === "unregistered");
    return Number(row?.pct || 0);
  }, [pieStatus]);

  const showUnregisteredWarning = unregisteredPct >= 40;

  return (
    <div className="panel panel--span6">
      <div className="panel__head">
        <div>
          <h3 className="panel__title">Estados de Asistencias</h3>
          <p className="panel__hint">
            Porcentaje del total de marcaciones dentro del rango.
          </p>
        </div>

        {showUnregisteredWarning && (
          <div className="panel__right">
            <Pill variant="neutral">
              Unregistered alto: {Math.round(unregisteredPct)}%
            </Pill>
            <span className="panel__muted">Falta tomar asistencia.</span>
          </div>
        )}
      </div>

      <div className="panel__chart">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              innerRadius={55}
              outerRadius={95}
              labelLine={false}
              label={({ value }) => `${value}%`}
            >
              {pieData.map((e) => (
                <Cell key={e.key} fill={e.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(v, name, props) => [
                `${v}% (${num(props?.payload?.count)})`,
                name,
              ]}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

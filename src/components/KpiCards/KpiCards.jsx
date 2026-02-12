import React from "react";
import "./KpiCards.css";
import { num, pct1 } from "../../utils/attendanceMappers";
import {
  RiGroupLine,
  RiFileList3Line,
  RiLineChartLine,
  RiAlertLine
} from "@remixicon/react";

function Card({ title, value, icon, iconBg }) {
  return (
    <div className="kpi-card">
      <div className="kpi-card__left">
        <div className="kpi-card__title">{title}</div>
        <div className="kpi-card__value">{value}</div>
      </div>
      <div className="kpi-card__icon" style={{ background: iconBg }}>
        {icon}
      </div>
    </div>
  );
}

export default function KpiCards({ kpis }) {
  return (
    <>
      <div className="kpi-card__span3">
        <Card
          title="Total Aprendices"
          value={num(kpis?.total_apprentices)}
          icon={<RiGroupLine></RiGroupLine>}
          iconBg="rgba(91,140,255,0.14)"
        />
      </div>

      <div className="kpi-card__span3">
        <Card
          title="Total Asistencias"
          value={num(kpis?.total_present_marks)}
          icon={<RiFileList3Line></RiFileList3Line>}
          iconBg="rgba(46,234,120,0.16)"
        />
      </div>

      <div className="kpi-card__span3">
        <Card
          title="Promedio Asistencias"
          value={pct1(kpis?.attendance_avg_pct)}
          icon={<RiLineChartLine></RiLineChartLine>}
          iconBg="rgba(124,58,237,0.14)"
        />
      </div>

      <div className="kpi-card__span3">
        <Card
          title="Alerta Deserción"
          value={num(kpis?.dropout_alert_count)}
          icon={<RiAlertLine></RiAlertLine>}
          iconBg="rgba(255,107,107,0.14)"
        />
      </div>
    </>
  );
}

// Importa React (necesario para JSX)
import React from "react";

// Importa estilos de las tarjetas KPI
import "./KpiCards.css";

// Importa utilidades de formateo de números
// num: formatea números con separadores de miles
// pct1: formatea porcentajes con 1 decimal
import { num, pct1 } from "../../utils/attendanceMappers";

// Importa iconos de Remix Icon para cada KPI
import {
  RiGroupLine,        // Icono de grupo de personas
  RiFileList3Line,    // Icono de lista/documentos
  RiLineChartLine,    // Icono de gráfico lineal
  RiAlertLine         // Icono de alerta
} from "@remixicon/react";

/**
 * Componente interno de tarjeta KPI individual.
 * 
 * Renderiza una tarjeta con:
 * - Título del KPI
 * - Valor numérico grande
 * - Icono con color de fondo personalizado
 * 
 * @component
 * @private
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.title - Título del KPI (ej: "Total Aprendices")
 * @param {string|number} props.value - Valor formateado del KPI
 * @param {React.ReactNode} props.icon - Componente de icono a mostrar
 * @param {string} props.iconBg - Color de fondo del icono (RGBA)
 * 
 * @returns {JSX.Element} Tarjeta KPI
 */
function Card({ title, value, icon, iconBg }) {
  return (
    <div className="kpi-card">
      
      {/* Lado izquierdo: título y valor */}
      <div className="kpi-card__left">
        {/* Título descriptivo del KPI */}
        <div className="kpi-card__title">{title}</div>
        
        {/* Valor numérico destacado */}
        <div className="kpi-card__value">{value}</div>
      </div>
      
      {/* Lado derecho: icono con fondo de color */}
      <div className="kpi-card__icon" style={{ background: iconBg }}>
        {icon}
      </div>
    </div>
  );
}

/**
 * Componente de tarjetas de KPIs (Key Performance Indicators) del dashboard.
 * 
 * Muestra 4 métricas clave de asistencias:
 * 1. Total Aprendices - Cantidad total de aprendices
 * 2. Total Asistencias - Cantidad de marcaciones presentes
 * 3. Promedio Asistencias - Porcentaje promedio de asistencia
 * 4. Alerta Deserción - Cantidad de aprendices en riesgo
 * 
 * Cada tarjeta tiene:
 * - Icono distintivo con color de fondo
 * - Valor formateado apropiadamente (número o porcentaje)
 * - Diseño responsive mediante clases de grid
 * 
 * @component
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.kpis - Objeto con los datos de KPIs
 * @param {number} [props.kpis.total_apprentices] - Total de aprendices
 * @param {number} [props.kpis.total_present_marks] - Total de marcaciones presentes
 * @param {number} [props.kpis.attendance_avg_pct] - Promedio de asistencia (0-100)
 * @param {number} [props.kpis.dropout_alert_count] - Cantidad de alertas de deserción
 * 
 * @returns {JSX.Element} Fragment con 4 tarjetas KPI
 * 
 * @example
 * <KpiCards
 *   kpis={{
 *     total_apprentices: 250,
 *     total_present_marks: 4800,
 *     attendance_avg_pct: 92.5,
 *     dropout_alert_count: 12
 *   }}
 * />
 */
export default function KpiCards({ kpis }) {
  return (
    // Fragment de React para retornar múltiples elementos
    <>
      {/* KPI 1: Total Aprendices
          Clase span3: ocupa 3 columnas del grid */}
      <div className="kpi-card__span3">
        <Card
          title="Total Aprendices"
          // num() formatea el número con separadores de miles (ej: 1,250)
          value={num(kpis?.total_apprentices)}
          icon={<RiGroupLine></RiGroupLine>}
          // Fondo azul claro con transparencia
          iconBg="rgba(91,140,255,0.14)"
        />
      </div>

      {/* KPI 2: Total Asistencias
          Muestra cantidad de marcaciones presentes */}
      <div className="kpi-card__span3">
        <Card
          title="Total Asistencias"
          value={num(kpis?.total_present_marks)}
          icon={<RiFileList3Line></RiFileList3Line>}
          // Fondo verde claro con transparencia
          iconBg="rgba(46,234,120,0.16)"
        />
      </div>

      {/* KPI 3: Promedio de Asistencias
          Muestra porcentaje promedio con 1 decimal */}
      <div className="kpi-card__span3">
        <Card
          title="Promedio Asistencias"
          // pct1() formatea como porcentaje con 1 decimal (ej: 92.5%)
          value={pct1(kpis?.attendance_avg_pct)}
          icon={<RiLineChartLine></RiLineChartLine>}
          // Fondo morado claro con transparencia
          iconBg="rgba(124,58,237,0.14)"
        />
      </div>

      {/* KPI 4: Alerta de Deserción
          Muestra cantidad de aprendices en riesgo */}
      <div className="kpi-card__span3">
        <Card
          title="Alerta Deserción"
          value={num(kpis?.dropout_alert_count)}
          icon={<RiAlertLine></RiAlertLine>}
          // Fondo rojo claro con transparencia
          iconBg="rgba(255,107,107,0.14)"
        />
      </div>
    </>
  );
}
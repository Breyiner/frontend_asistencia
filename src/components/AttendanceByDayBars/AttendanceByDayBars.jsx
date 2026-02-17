// Importa React y el hook useMemo para optimización de rendimiento
import React, { useMemo } from "react";

// Importa los estilos específicos del componente de gráfico de barras
import "./AttendanceByDayBars.css";

// Importa componentes de la librería Recharts para crear gráficos
import {
  ResponsiveContainer,  // Contenedor que se adapta al tamaño disponible
  BarChart,            // Componente principal del gráfico de barras
  Bar,                 // Componente que define cada barra del gráfico
  XAxis,               // Eje X (horizontal)
  YAxis,               // Eje Y (vertical)
  CartesianGrid,       // Grid de fondo del gráfico
  Tooltip,             // Tooltip que aparece al hacer hover
  Legend,              // Leyenda del gráfico
} from "recharts";

// Importa utilidades para procesar datos de asistencia
// COLORS: objeto con colores para cada estado
// calcRangeDays: calcula días entre dos fechas
// mapBarsByDay: transforma datos para el formato del gráfico
// num: formateador de números
import { COLORS, calcRangeDays, mapBarsByDay, num } from "../../utils/attendanceMappers";

/**
 * Componente de gráfico de barras para visualizar asistencias por día.
 * 
 * Muestra un gráfico de barras apiladas con:
 * - Barras verdes para asistencias (presentes)
 * - Barras rojas para inasistencias (ausentes)
 * 
 * El formato de las etiquetas del eje X se adapta automáticamente según
 * el rango de días:
 * - Rangos <= 16 días: muestra solo el día (DD)
 * - Rangos > 16 días: muestra mes y día (MM-DD)
 * 
 * Usa useMemo para optimizar el rendimiento evitando recálculos innecesarios
 * cuando las props no cambian.
 * 
 * @component
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.barsByDay - Objeto con datos de asistencia por día
 * @param {string} props.rangeFrom - Fecha de inicio del rango (formato ISO)
 * @param {string} props.rangeTo - Fecha de fin del rango (formato ISO)
 * 
 * @returns {JSX.Element} Panel con gráfico de barras de asistencias
 * 
 * @example
 * <AttendanceByDayBars
 *   barsByDay={{ "2024-01-15": { present: 25, absent: 3 }, ... }}
 *   rangeFrom="2024-01-01"
 *   rangeTo="2024-01-31"
 * />
 */
export default function AttendanceByDayBars({ barsByDay, rangeFrom, rangeTo }) {
  
  // Calcula la cantidad de días en el rango seleccionado
  // useMemo cachea el resultado y solo recalcula si rangeFrom o rangeTo cambian
  const rangeDays = useMemo(() => calcRangeDays(rangeFrom, rangeTo), [rangeFrom, rangeTo]);
  
  // Determina qué formato de etiqueta usar en el eje X según el rango de días
  // - "dd": solo día (1, 2, 3...) para rangos cortos (<=16 días)
  // - "mmdd": mes-día (01-15, 01-16...) para rangos largos (>16 días)
  // useMemo evita recalcular en cada render si rangeDays no cambia
  const barLabelKey = useMemo(() => (rangeDays > 16 ? "mmdd" : "dd"), [rangeDays]);

  // Transforma los datos raw de asistencias al formato requerido por Recharts
  // mapBarsByDay convierte el objeto barsByDay en un array de objetos
  // Formato esperado: [{ dd: "15", mmdd: "01-15", present: 25, absent: 3 }, ...]
  // useMemo cachea el resultado para evitar transformaciones innecesarias
  const data = useMemo(() => mapBarsByDay(barsByDay), [barsByDay]);

  return (
    // Panel contenedor que ocupa 6 columnas del grid (panel--span6)
    <div className="panel panel--span6">
      
      {/* Título del panel */}
      <h3 className="panel__title">Asistencias por Día</h3>
      
      {/* Texto de ayuda que explica el significado de los colores y formato */}
      <p className="panel__hint">
        Verde = presentes, rojo = ausentes. Etiqueta: {barLabelKey === "mmdd" ? "MM-DD" : "DD"}.
      </p>

      {/* Contenedor del gráfico */}
      <div className="panel__chart">
        
        {/* ResponsiveContainer hace que el gráfico se adapte al 100% del contenedor
            width="100%" y height="100%" permiten que sea responsive */}
        <ResponsiveContainer width="100%" height="100%">
          
          {/* Componente principal del gráfico de barras
              - data: array de datos a graficar
              - margin: espaciado interno del gráfico */}
          <BarChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
            
            {/* Grid de fondo con líneas punteadas (3px línea, 3px espacio) */}
            <CartesianGrid strokeDasharray="3 3" />
            
            {/* Eje X (horizontal)
                dataKey indica qué propiedad de los datos usar como etiqueta
                Usa barLabelKey que puede ser "dd" o "mmdd" */}
            <XAxis dataKey={barLabelKey} />
            
            {/* Eje Y (vertical) - valores numéricos de asistencias */}
            <YAxis />
            
            {/* Tooltip que aparece al hacer hover sobre las barras
                formatter personaliza el texto mostrado:
                - v: valor numérico
                - name: nombre de la serie ("present" o "absent")
                num(v) formatea el número, traduce "present" a "Asistencias" */}
            <Tooltip
              formatter={(v, name) => [num(v), name === "present" ? "Asistencias" : "Inasistencias"]}
            />
            
            {/* Leyenda del gráfico
                formatter traduce los nombres técnicos a español */}
            <Legend
              formatter={(value) => (value === "present" ? "Asistencias" : "Inasistencias")}
            />
            
            {/* Barra de asistencias (presente)
                - dataKey: propiedad de los datos a graficar
                - fill: color de la barra (verde, definido en COLORS.present)
                - radius: bordes redondeados en la parte superior [topLeft, topRight, bottomRight, bottomLeft] */}
            <Bar dataKey="present" fill={COLORS.present} radius={[8, 8, 0, 0]} />
            
            {/* Barra de inasistencias (ausente)
                - fill: color rojo (COLORS.absent)
                - radius: bordes redondeados superiores */}
            <Bar dataKey="absent" fill={COLORS.absent} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
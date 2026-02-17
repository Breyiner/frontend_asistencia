// Importa React y el hook useMemo para optimización de rendimiento
import React, { useMemo } from "react";

// Importa los estilos específicos del componente de gráfico circular
import "./AttendanceStatusPie.css";

// Importa componentes de la librería Recharts para crear gráficos circulares
import {
  ResponsiveContainer,  // Contenedor responsive que se adapta al tamaño disponible
  PieChart,            // Componente principal del gráfico circular
  Pie,                 // Componente que define el gráfico de pastel/dona
  Cell,                // Componente para colorear individualmente cada segmento
  Tooltip,             // Tooltip que aparece al hacer hover
  Legend,              // Leyenda del gráfico
} from "recharts";

// Importa componente Pill para mostrar alertas/etiquetas
import Pill from "../Pill/Pill";

// Importa utilidades para transformar y formatear datos de asistencia
// mapPieData: transforma datos raw al formato requerido por Recharts
// num: formatea números para presentación
import { mapPieData, num } from "../../utils/attendanceMappers";

/**
 * Componente de gráfico circular (pie/dona) para visualizar distribución de estados de asistencia.
 * 
 * Muestra un gráfico de dona (con agujero central) que representa los porcentajes
 * de cada estado de asistencia:
 * - Presente, Ausente, Tarde, Ausencia Justificada, Salida Temprana, Sin Registrar
 * 
 * Características:
 * - Muestra porcentajes directamente en cada segmento
 * - Tooltip con información detallada (porcentaje + cantidad)
 * - Alerta visual cuando el porcentaje de "Sin Registrar" es >= 40%
 * - Optimizado con useMemo para evitar recálculos innecesarios
 * 
 * @component
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.pieStatus - Array de objetos con datos de estados de asistencia
 * @param {string} props.pieStatus[].code - Código del estado (present, absent, etc.)
 * @param {number} props.pieStatus[].pct - Porcentaje del total
 * @param {number} props.pieStatus[].count - Cantidad absoluta de registros
 * @param {string} props.pieStatus[].name - Nombre legible del estado
 * 
 * @returns {JSX.Element} Panel con gráfico circular de estados de asistencia
 * 
 * @example
 * <AttendanceStatusPie
 *   pieStatus={[
 *     { code: "present", pct: 60, count: 120, name: "Presente" },
 *     { code: "absent", pct: 15, count: 30, name: "Ausente" },
 *     { code: "unregistered", pct: 25, count: 50, name: "Sin Registrar" }
 *   ]}
 * />
 */
export default function AttendanceStatusPie({ pieStatus }) {
  
  // Transforma los datos raw al formato requerido por Recharts
  // mapPieData convierte el array pieStatus en un array con estructura:
  // [{ key, name, value, count, color }, ...]
  // useMemo cachea el resultado y solo recalcula si pieStatus cambia
  const pieData = useMemo(() => mapPieData(pieStatus), [pieStatus]);

  // Calcula el porcentaje de registros "sin registrar" para mostrar advertencia
  // Busca el objeto con code "unregistered" y extrae su porcentaje
  // useMemo evita recalcular en cada render si pieStatus no cambia
  const unregisteredPct = useMemo(() => {
    // Busca el registro con código "unregistered" en el array pieStatus
    const row = (pieStatus || []).find((x) => x.code === "unregistered");
    
    // Retorna el porcentaje como número o 0 si no existe
    return Number(row?.pct || 0);
  }, [pieStatus]);

  // Determina si debe mostrar la advertencia de alto porcentaje sin registrar
  // Se muestra cuando unregisteredPct es mayor o igual a 40%
  const showUnregisteredWarning = unregisteredPct >= 40;

  return (
    // Panel contenedor que ocupa 6 columnas del grid (panel--span6)
    <div className="panel panel--span6">
      
      {/* Cabecera del panel con título y advertencia condicional */}
      <div className="panel__head">
        
        {/* Sección izquierda: título y descripción */}
        <div>
          {/* Título del panel */}
          <h3 className="panel__title">Estados de Asistencias</h3>
          
          {/* Texto de ayuda explicando qué representa el gráfico */}
          <p className="panel__hint">
            Porcentaje del total de marcaciones dentro del rango.
          </p>
        </div>

        {/* Sección derecha: advertencia de alto porcentaje sin registrar
            Solo se muestra si showUnregisteredWarning es true */}
        {showUnregisteredWarning && (
          <div className="panel__right">
            {/* Pill (etiqueta) neutral mostrando el porcentaje sin registrar
                Math.round redondea el porcentaje a entero */}
            <Pill variant="neutral">
              Unregistered alto: {Math.round(unregisteredPct)}%
            </Pill>
            
            {/* Texto explicativo de la advertencia */}
            <span className="panel__muted">Falta tomar asistencia.</span>
          </div>
        )}
      </div>

      {/* Contenedor del gráfico */}
      <div className="panel__chart">
        
        {/* ResponsiveContainer hace que el gráfico se adapte al 100% del contenedor */}
        <ResponsiveContainer width="100%" height="100%">
          
          {/* Componente principal del gráfico circular */}
          <PieChart>
            
            {/* Componente Pie que define el gráfico de dona
                - data: datos transformados por mapPieData
                - dataKey: propiedad que contiene el valor numérico (porcentaje)
                - nameKey: propiedad que contiene el nombre del segmento
                - innerRadius: radio interno (crea el agujero central para efecto dona)
                - outerRadius: radio externo del gráfico
                - labelLine: desactiva las líneas que conectan labels con segmentos
                - label: función que renderiza el porcentaje en cada segmento */}
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              innerRadius={55}
              outerRadius={95}
              labelLine={false}
              label={({ value }) => `${value}%`} // Muestra "60%" en cada segmento
            >
              {/* Mapea cada elemento de pieData para asignar colores individuales
                  Cell permite colorear cada segmento con su color específico */}
              {pieData.map((e) => (
                <Cell key={e.key} fill={e.color} />
              ))}
            </Pie>
            
            {/* Tooltip personalizado que aparece al hacer hover
                formatter recibe: valor, nombre, objeto props completo
                Muestra formato: "60% (120)" - porcentaje y cantidad entre paréntesis
                num() formatea el número de count para mejor legibilidad */}
            <Tooltip
              formatter={(v, name, props) => [
                `${v}% (${num(props?.payload?.count)})`,
                name,
              ]}
            />
            
            {/* Leyenda del gráfico que muestra los nombres de cada estado con su color */}
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
// Importa React (necesario para JSX)
import React from "react";

// Importa estilos de la barra superior del dashboard
import "./DashTopBar.css";

// Importa componentes reutilizables
import InputField from "../InputField/InputField";
import Button from "../Button/Button";

/**
 * Componente de barra superior para filtros del dashboard de asistencias.
 * 
 * Proporciona controles para filtrar datos del dashboard:
 * - Selector de programa de formación
 * - Selector de ficha (dependiente del programa)
 * - Selectores de rango de fechas con presets y personalizado
 * - Botones de limpiar y recargar
 * 
 * Los presets de rango incluyen:
 * - Últimos 7 días
 * - Este mes
 * - Últimos 30 días
 * - Personalizado (permite seleccionar fechas específicas)
 * 
 * @component
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.preset - Preset de rango activo ("7d", "month", "30d", "custom")
 * @param {Function} props.setPreset - Función para cambiar el preset
 * @param {string} props.from - Fecha de inicio (formato YYYY-MM-DD)
 * @param {Function} props.setFrom - Función para cambiar fecha de inicio
 * @param {string} props.to - Fecha de fin (formato YYYY-MM-DD)
 * @param {Function} props.setTo - Función para cambiar fecha de fin
 * @param {string} props.trainingProgramId - ID del programa seleccionado
 * @param {Function} props.setTrainingProgramId - Función para cambiar programa
 * @param {string} props.fichaId - ID de la ficha seleccionada
 * @param {Function} props.setFichaId - Función para cambiar ficha
 * @param {Array} props.programOptions - Opciones del selector de programas
 * @param {Array} props.fichaOptions - Opciones del selector de fichas
 * @param {boolean} props.loading - Indica si están cargando datos
 * @param {boolean} props.programsLoading - Indica si están cargando programas
 * @param {boolean} props.fichasLoading - Indica si están cargando fichas
 * @param {string} props.err - Mensaje de error si existe
 * @param {string} props.rangeLabel - Etiqueta del rango actual
 * @param {Function} props.onClear - Callback para limpiar filtros
 * @param {Function} props.onReload - Callback para recargar datos
 * 
 * @returns {JSX.Element} Barra de filtros del dashboard
 * 
 * @example
 * <DashTopBar
 *   preset="7d"
 *   setPreset={setPreset}
 *   from="2024-01-01"
 *   setFrom={setFrom}
 *   to="2024-01-07"
 *   setTo={setTo}
 *   trainingProgramId="123"
 *   setTrainingProgramId={setTrainingProgramId}
 *   fichaId="456"
 *   setFichaId={setFichaId}
 *   programOptions={programs}
 *   fichaOptions={fichas}
 *   loading={false}
 *   rangeLabel="01/01/2024 - 07/01/2024"
 *   onClear={handleClear}
 *   onReload={handleReload}
 * />
 */
export default function DashTopBar({
  preset,
  setPreset,
  from,
  setFrom,
  to,
  setTo,
  trainingProgramId,
  setTrainingProgramId,
  fichaId,
  setFichaId,
  programOptions,
  fichaOptions,
  loading,
  programsLoading,
  fichasLoading,
  err,
  rangeLabel,
  onClear,
  onReload,
}) {
  return (
    // Contenedor principal de la barra de filtros
    <div className="dash-topbar">
      
      {/* Columna 1: Selector de Programa (ocupa 4 espacios del grid) */}
      <div className="dash-topbar__col dash-topbar__col--span4">
        <InputField
          label="Programa"
          name="training_program_id"
          value={trainingProgramId}
          onChange={(e) => setTrainingProgramId(e.target.value)}
          options={programOptions}
          disabled={programsLoading || loading}
          placeholder="Seleccione..."
          combo // Indica que es un combo (select con busqueda), no un input
        />
      </div>

      {/* Columna 2: Selector de Ficha (ocupa 4 espacios del grid) */}
      <div className="dash-topbar__col dash-topbar__col--span4">
        <InputField
          label="Ficha"
          name="ficha_id"
          value={fichaId}
          onChange={(e) => setFichaId(e.target.value)}
          options={fichaOptions}
          disabled={fichasLoading || loading}
          // Placeholder dinámico según si hay programa seleccionado
          placeholder={trainingProgramId ? "Seleccione..." : "Seleccione (opcional)"}
          combo
        />
        
        {/* Mensaje de ayuda sobre el riesgo */}
        <div className="dash-topbar__hint">
          El riesgo solo aparece cuando seleccionas ficha.
        </div>
      </div>

      {/* Columna 3: Selectores de Rango de Fechas (ocupa 4 espacios del grid) */}
      <div className="dash-topbar__col dash-topbar__col--span4">
        
        {/* Etiqueta de la sección */}
        <div className="dash-topbar__label">Rango</div>

        {/* Botones de presets de rango */}
        <div className="dash-topbar__presets">
          
          {/* Preset: Últimos 7 días */}
          <Button
            variant={preset === "7d" ? "primary" : "secondary"} // Primary si está activo
            onClick={() => setPreset("7d")}
            disabled={loading}
            type="button"
          >
            Últimos 7 días
          </Button>
          
          {/* Preset: Este mes */}
          <Button
            variant={preset === "month" ? "primary" : "secondary"}
            onClick={() => setPreset("month")}
            disabled={loading}
            type="button"
          >
            Este mes
          </Button>
          
          {/* Preset: Últimos 30 días */}
          <Button
            variant={preset === "30d" ? "primary" : "secondary"}
            onClick={() => setPreset("30d")}
            disabled={loading}
            type="button"
          >
            Últimos 30 días
          </Button>
          
          {/* Preset: Personalizado */}
          <Button
            variant={preset === "custom" ? "primary" : "secondary"}
            onClick={() => setPreset("custom")}
            disabled={loading}
            type="button"
          >
            Personalizado
          </Button>
        </div>

        {/* Campos de fecha personalizados - solo se muestran si preset es "custom"
            Renderizado condicional con && */}
        {preset === "custom" && (
          <div className="dash-topbar__dates">
            {/* Input de fecha "Desde" */}
            <InputField
              label="Desde"
              name="from"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              disabled={loading}
            />
            
            {/* Input de fecha "Hasta" */}
            <InputField
              label="Hasta"
              name="to"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              disabled={loading}
            />
          </div>
        )}

        {/* Línea de estado: muestra mensaje de carga, error o rango actual */}
        <div className="dash-topbar__status">
          {loading ? "Cargando..." : err ? err : `Mostrando: ${rangeLabel}`}
        </div>
      </div>

      {/* Barra de herramientas: botones de acción */}
      <div className="dash-topbar__toolbar">
        {/* Botón para limpiar filtros */}
        <Button variant="secondary" onClick={onClear} disabled={loading} type="button">
          Limpiar
        </Button>
        
        {/* Botón para recargar datos
            Muestra "Recargando..." durante la carga */}
        <Button variant="primary" onClick={onReload} disabled={loading} type="button">
          {loading ? "Recargando..." : "Recargar"}
        </Button>
      </div>
    </div>
  );
}
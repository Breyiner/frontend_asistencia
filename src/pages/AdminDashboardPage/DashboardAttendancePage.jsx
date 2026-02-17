// Importaciones de React
import React, { useEffect, useMemo } from "react";
import "./DashboardAttendancePage.css";

// Hooks personalizados para gestión de estado
import { useAttendanceFilters } from "../../hooks/useAttendanceFilters";
import { useAttendanceDashboard } from "../../hooks/useAttendanceDashboard";
import { useFichasByProgramCatalog } from "../../hooks/useFichasByProgramCatalog";

// Componentes de visualización del dashboard
import DashTopBar from "../../components/DashTopBar/DashTopBar";
import KpiCards from "../../components/KpiCards/KpiCards";
import AttendanceStatusPie from "../../components/AttendanceStatusPie/AttendanceStatusPie";
import AttendanceByDayBars from "../../components/AttendanceByDayBars/AttendanceByDayBars";
import TopFichasAbsencesTable from "../../components/TopFichasAbsencesTable/TopFichasAbsencesTable";
import RiskApprenticesTable from "../../components/RiskApprenticesTable/RiskApprenticesTable";

/**
 * Componente principal del dashboard de asistencias.
 * 
 * Gestiona la visualización y filtrado de datos de asistencia mediante
 * múltiples componentes gráficos (KPIs, gráficos de torta, barras) y tablas.
 * 
 * Características:
 * - Filtrado por rango de fechas (presets o custom)
 * - Filtrado por programa de formación y ficha
 * - Visualización de KPIs principales
 * - Gráficos de distribución y tendencias
 * - Tablas de fichas y aprendices en riesgo
 * - Manejo de estados de carga y errores
 * - Recarga manual de datos
 * 
 * Flujo:
 * 1. Usuario selecciona filtros (fecha, programa, ficha)
 * 2. Se construyen queryParams basados en filtros
 * 3. Se consulta dashboard del backend
 * 4. Se renderizan componentes con datos recibidos
 * 
 * @component
 * @returns {JSX.Element} Página completa del dashboard de asistencias
 */
export default function DashboardAttendancePage() {
  // Hook que gestiona todos los filtros del dashboard (preset, fechas, programa, ficha)
  const filters = useAttendanceFilters();

  // Catálogo de programas de formación disponibles
  const programsCatalog = filters.programsCatalog;
  
  // Catálogo de fichas filtrado por el programa seleccionado
  const fichasCatalog = useFichasByProgramCatalog(filters.trainingProgramId);

  /**
   * Efecto para limpiar la ficha seleccionada cuando cambia el programa.
   * 
   * Evita inconsistencias mostrando fichas que no pertenecen al programa actual.
   */
  useEffect(() => {
    filters.setFichaId("");
  }, [filters.trainingProgramId]);

  /**
   * Construye objeto de parámetros de consulta basado en filtros activos.
   * 
   * Se recalcula solo cuando cambian los filtros relevantes.
   * Incluye preset, fechas custom, programa y ficha.
   */
  const queryParams = useMemo(() => {
    // Objeto base con preset obligatorio
    const p = { preset: filters.preset };

    // Si es custom, agrega fechas from/to
    if (filters.preset === "custom") {
      p.from = filters.from || "";
      p.to = filters.to || "";
    }

    // Agrega programa si está seleccionado
    if (filters.trainingProgramId) p.training_program_id = Number(filters.trainingProgramId);
    
    // Agrega ficha si está seleccionada
    if (filters.fichaId) p.ficha_id = Number(filters.fichaId);

    return p;
  }, [filters.preset, filters.from, filters.to, filters.trainingProgramId, filters.fichaId]);

  /**
   * Hook que consulta datos del dashboard desde el backend.
   * 
   * Retorna:
   * - dash: objeto con kpis, gráficos y tablas
   * - summary: metadatos (from, to)
   * - loading: estado de carga
   * - err: mensaje de error si falla
   * - reload: función para recargar datos
   * - clearError: función para limpiar errores
   * - setDashToEmpty: función para vaciar dashboard
   */
  const { dash, summary, loading, err, reload, clearError, setDashToEmpty } =
    useAttendanceDashboard(queryParams);

  /**
   * Maneja la recarga manual de datos del dashboard.
   * 
   * @async
   */
  const handleReload = async () => {
    await reload();
  };

  /**
   * Maneja la limpieza de filtros y errores.
   * 
   * Resetea todos los filtros a valores por defecto
   * y limpia mensajes de error.
   */
  const handleClear = () => {
    filters.reset();
    clearError();
  };

  /**
   * Calcula información de visualización del rango de fechas.
   * 
   * Genera label amigable según el preset:
   * - "7d" → "Últimos 7 días"
   * - "30d" → "Últimos 30 días"
   * - "month" → "Este mes"
   * - "custom" → "YYYY-MM-DD a YYYY-MM-DD"
   */
  const rangeInfo = useMemo(() => {
    const s = summary || {};
    const label =
      filters.preset === "custom"
        ? `${s.from ?? ""} a ${s.to ?? ""}`
        : filters.preset === "7d"
        ? "Últimos 7 días"
        : filters.preset === "30d"
        ? "Últimos 30 días"
        : filters.preset === "month"
        ? "Este mes"
        : "";
    return { label, from: s.from, to: s.to };
  }, [summary, filters.preset]);

  /**
   * Efecto para vaciar dashboard cuando hay error.
   * 
   * Mantiene consistencia visual evitando mostrar datos
   * desactualizados junto a mensaje de error.
   */
  useEffect(() => {
    if (err) setDashToEmpty();
  }, [err, setDashToEmpty]);

  return (
    <div className="dash-att-page">
      {/* Barra superior con controles de filtros y acciones */}
      <DashTopBar
        preset={filters.preset}
        setPreset={filters.setPreset}
        from={filters.from}
        setFrom={filters.setFrom}
        to={filters.to}
        setTo={filters.setTo}
        trainingProgramId={filters.trainingProgramId}
        setTrainingProgramId={filters.setTrainingProgramId}
        fichaId={filters.fichaId}
        setFichaId={filters.setFichaId}
        programOptions={programsCatalog.options || []}
        fichaOptions={fichasCatalog.options || []}
        loading={loading}
        programsLoading={programsCatalog.loading}
        fichasLoading={fichasCatalog.loading}
        err={err}
        rangeLabel={rangeInfo.label}
        onClear={handleClear}
        onReload={handleReload}
      />

      {/* Grid con visualizaciones principales */}
      <div className="dash-att-page__grid">
        {/* Tarjetas con indicadores clave (total, presentes, ausentes, etc.) */}
        <KpiCards kpis={dash.kpis} />

        {/* Gráfico de torta con distribución de estados de asistencia */}
        <AttendanceStatusPie pieStatus={dash.pie_status} />

        {/* Gráfico de barras con asistencias agrupadas por día */}
        <AttendanceByDayBars
          barsByDay={dash.bars_by_day}
          rangeFrom={summary?.from}
          rangeTo={summary?.to}
        />
      </div>

      {/* Tabla con fichas ordenadas por mayor cantidad de ausencias */}
      <TopFichasAbsencesTable rows={dash.top_fichas_absences} />

      {/* Tabla con aprendices en riesgo por alto porcentaje de ausencias */}
      <RiskApprenticesTable rows={dash.risk_apprentices} />
    </div>
  );
}

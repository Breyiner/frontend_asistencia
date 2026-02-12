import React, { useEffect, useMemo } from "react";
import "./DashboardAttendancePage.css";

import { useAttendanceFilters } from "../../hooks/useAttendanceFilters";
import { useAttendanceDashboard } from "../../hooks/useAttendanceDashboard";
import { useFichasByProgramCatalog } from "../../hooks/useFichasByProgramCatalog";

import DashTopBar from "../../components/DashTopBar/DashTopBar";
import KpiCards from "../../components/KpiCards/KpiCards";
import AttendanceStatusPie from "../../components/AttendanceStatusPie/AttendanceStatusPie";
import AttendanceByDayBars from "../../components/AttendanceByDayBars/AttendanceByDayBars";
import TopFichasAbsencesTable from "../../components/TopFichasAbsencesTable/TopFichasAbsencesTable";
import RiskApprenticesTable from "../../components/RiskApprenticesTable/RiskApprenticesTable";

export default function DashboardAttendancePage() {
  const filters = useAttendanceFilters();

  // catálogos
  const programsCatalog = filters.programsCatalog;
  const fichasCatalog = useFichasByProgramCatalog(filters.trainingProgramId);

  // limpiar ficha al cambiar programa
  useEffect(() => {
    filters.setFichaId("");
  }, [filters.trainingProgramId]);

  const queryParams = useMemo(() => {
    const p = { preset: filters.preset };

    if (filters.preset === "custom") {
      p.from = filters.from || "";
      p.to = filters.to || "";
    }

    if (filters.trainingProgramId) p.training_program_id = Number(filters.trainingProgramId);
    if (filters.fichaId) p.ficha_id = Number(filters.fichaId);

    return p;
  }, [filters.preset, filters.from, filters.to, filters.trainingProgramId, filters.fichaId]);

  const { dash, summary, loading, err, reload, clearError, setDashToEmpty } =
    useAttendanceDashboard(queryParams);

  const handleReload = async () => {
    await reload();
  };

  const handleClear = () => {
    filters.reset();
    clearError();
  };

  // rango UI
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

  // si el backend devuelve error con summary, mantén consistencia
  useEffect(() => {
    if (err) setDashToEmpty();
  }, [err, setDashToEmpty]);

  return (
    <div className="dash-att-page">
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

      <div className="dash-att-page__grid">
        <KpiCards kpis={dash.kpis} />

        <AttendanceStatusPie pieStatus={dash.pie_status} />

        <AttendanceByDayBars
          barsByDay={dash.bars_by_day}
          rangeFrom={summary?.from}
          rangeTo={summary?.to}
        />
      </div>

      <TopFichasAbsencesTable rows={dash.top_fichas_absences} />

      <RiskApprenticesTable rows={dash.risk_apprentices} />
    </div>
  );
}
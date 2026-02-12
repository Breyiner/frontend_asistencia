import React from "react";
import "./DashTopBar.css";
import InputField from "../InputField/InputField";
import Button from "../Button/Button";

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
    <div className="dash-topbar">
      <div className="dash-topbar__col dash-topbar__col--span4">
        <InputField
          label="Programa"
          name="training_program_id"
          value={trainingProgramId}
          onChange={(e) => setTrainingProgramId(e.target.value)}
          options={programOptions}
          disabled={programsLoading || loading}
          placeholder="Seleccione..."
          select
        />
      </div>

      <div className="dash-topbar__col dash-topbar__col--span4">
        <InputField
          label="Ficha"
          name="ficha_id"
          value={fichaId}
          onChange={(e) => setFichaId(e.target.value)}
          options={fichaOptions}
          disabled={fichasLoading || loading}
          placeholder={trainingProgramId ? "Seleccione..." : "Seleccione (opcional)"}
          select
        />
        <div className="dash-topbar__hint">
          El riesgo solo aparece cuando seleccionas ficha.
        </div>
      </div>

      <div className="dash-topbar__col dash-topbar__col--span4">
        <div className="dash-topbar__label">Rango</div>

        <div className="dash-topbar__presets">
          <Button
            variant={preset === "7d" ? "primary" : "secondary"}
            onClick={() => setPreset("7d")}
            disabled={loading}
            type="button"
          >
            Últimos 7 días
          </Button>
          <Button
            variant={preset === "month" ? "primary" : "secondary"}
            onClick={() => setPreset("month")}
            disabled={loading}
            type="button"
          >
            Este mes
          </Button>
          <Button
            variant={preset === "30d" ? "primary" : "secondary"}

            onClick={() => setPreset("30d")}
            disabled={loading}
            type="button"
          >
            Últimos 30 días
          </Button>
          <Button
            variant={preset === "custom" ? "primary" : "secondary"}
            onClick={() => setPreset("custom")}
            disabled={loading}
            type="button"
          >
            Personalizado
          </Button>
        </div>

        {preset === "custom" && (
          <div className="dash-topbar__dates">
            <InputField
              label="Desde"
              name="from"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              disabled={loading}
            />
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

        <div className="dash-topbar__status">
          {loading ? "Cargando..." : err ? err : `Mostrando: ${rangeLabel}`}
        </div>
      </div>

      <div className="dash-topbar__toolbar">
        <Button variant="secondary" onClick={onClear} disabled={loading} type="button">
          Limpiar
        </Button>
        <Button variant="primary" onClick={onReload} disabled={loading} type="button">
          {loading ? "Recargando..." : "Recargar"}
        </Button>
      </div>
    </div>
  );
}

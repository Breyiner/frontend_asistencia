import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../services/apiClient";

const EMPTY_DASH = {
  kpis: {
    total_apprentices: 0,
    total_present_marks: 0,
    attendance_avg_pct: 0,
    dropout_alert_count: 0,
  },
  pie_status: [],
  bars_by_day: [],
  top_fichas_absences: [],
  risk_apprentices: [],
};

function buildDashboardQuery(paramsObj) {
  const params = new URLSearchParams();
  Object.entries(paramsObj || {}).forEach(([k, v]) => {
    if (v === null || v === undefined) return;
    if (typeof v === "string" && v.trim() === "") return;
    params.append(k, String(v));
  });
  return params.toString();
}

export function useAttendanceDashboard(queryParams) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [dash, setDash] = useState(EMPTY_DASH);
  const [summary, setSummary] = useState(null);

  const qs = useMemo(() => buildDashboardQuery(queryParams), [queryParams]);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setErr("");

    try {
      const res = await api.get(`dashboard/attendance?${qs}`);

      if (!res.ok) {
        setErr(res.message || "No se pudo cargar el dashboard.");
        setDash(EMPTY_DASH);
        setSummary(res.summary ?? null);
        return;
      }

      setDash(res.data || EMPTY_DASH);
      setSummary(res.summary ?? null);
    } catch (e) {
      setErr(e?.message || "Error de conexión.");
      setDash(EMPTY_DASH);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [qs]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const reload = async () => {
    await fetchDashboard();
  };

  const clearError = () => setErr("");

  const setDashToEmpty = () => setDash(EMPTY_DASH);

  return { dash, summary, loading, err, reload, clearError, setDashToEmpty };
}

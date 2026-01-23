import { useCallback, useEffect, useState } from "react";
import { api } from "../services/apiClient";
import { error } from "../utils/alertas";

export default function useAttendancesByRealClass(realClassId) {
  const [attendances, setAttendances] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loadingAttendances, setLoadingAttendances] = useState(false);

  const fetchAttendances = useCallback(async () => {
    if (!realClassId) return;

    setLoadingAttendances(true);
    try {
      const res = await api.get(`attendances/class/${realClassId}`);
      if (!res.ok) {
        setAttendances([]);
        setSummary(null);
        await error(res.message || "No se pudieron cargar las asistencias.");
        return;
      }

      setAttendances(res.data || []);
      setSummary(res.summary || null);
    } catch (e) {
      setAttendances([]);
      setSummary(null);
      await error(e?.message || "Error de conexión.");
    } finally {
      setLoadingAttendances(false);
    }
  }, [realClassId]);

  useEffect(() => {
    fetchAttendances();
  }, [fetchAttendances]);

  return {
    attendances,
    setAttendances,
    summary,
    setSummary,
    loadingAttendances,
    refetchAttendances: fetchAttendances,
  };
}
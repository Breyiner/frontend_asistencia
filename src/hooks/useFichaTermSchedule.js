import { useCallback, useEffect, useState } from "react";
import { api } from "../services/apiClient";
import { confirm, error, success } from "../utils/alertas";

export default function useFichaTermSchedule({ fichaTermId }) {
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSchedule = useCallback(async () => {
    if (!fichaTermId) return;
    setLoading(true);
    try {
      const res = await api.get(`schedules/ficha_term/${fichaTermId}`);
      if (!res.ok) {
        setSchedule(null);
        await error(res.message || "No se pudo cargar el horario.");
        return;
      }
      console.log(res);
      
      setSchedule(res.data);
    } finally {
      setLoading(false);
    }
  }, [fichaTermId]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const deleteSession = useCallback(
    async (sessionId) => {
      const confirmed = await confirm("¿Eliminar este día del horario?");
      if (!confirmed.isConfirmed) return false;

      try {
        setLoading(true);

        const res = await api.delete(`schedule_sessions/${sessionId}`);

        if (!res.ok) {
          await error(res.message || "No se pudo eliminar la sesión.");
          return false;
        }

        await success(res.message || "Sesión eliminada.");
        await fetchSchedule();
        return true;
      } catch (e) {
        await error(e?.message || "Error de conexión.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetchSchedule]
  );

  return {
    schedule,
    loading,
    refetch: fetchSchedule,
    deleteSession
  };
}
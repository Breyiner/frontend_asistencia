import { useCallback, useEffect, useState } from "react";
import { api } from "../services/apiClient";
import { error } from "../utils/alertas";

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

  return {
    schedule,
    loading,
    refetch: fetchSchedule,
  };
}
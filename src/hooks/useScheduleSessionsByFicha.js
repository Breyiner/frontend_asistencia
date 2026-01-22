import { useCallback, useEffect, useState } from "react";
import { api } from "../services/apiClient";

export default function useScheduleSessionsByFicha(fichaId) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOptions = useCallback(async () => {
    if (!fichaId) {
      setOptions([]);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get(`schedule_sessions/ficha/${fichaId}`);

      if (!res.ok) {
        setOptions([]);
        return;
      }

      const opts = (res.data || []).map((x) => ({
        value: String(x.id),
        label: x.name || x.label || `Sesión #${x.id}`,
      }));

      setOptions(opts);
    } finally {
      setLoading(false);
    }
  }, [fichaId]);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  return { options, loading, refetch: fetchOptions };
}
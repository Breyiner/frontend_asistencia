import { useEffect, useState, useCallback } from "react";
import { api } from "../services/apiClient";

export default function useCatalog(endpoint) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(endpoint);

      if (res.ok) {
        const mapped = (res.data || []).map((item) => ({
          value: String(item.id),
          label: item.name || item.number || item.full_name || item.ficha_number,
        }));

        console.log(res.data);
        

        setOptions(mapped);
      } else {
        setOptions([]);
      }
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    load();
  }, [load]);

  return { options, loading };
}
import { useEffect, useState, useCallback } from "react";
import { api } from "../services/apiClient";

export default function useCatalog(endpoint, config = {}) {
  const { keep = false, mapLabel } = config;

  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(endpoint);

      if (res.ok) {
        const mapped = (res.data || []).map((item) => {
          const label =
            typeof mapLabel === "function"
              ? mapLabel(item)
              : item.name || item.number || item.full_name || item.ficha_number || "";

          const opt = {
            value: String(item.id),
            label,
          };

          if (keep) opt.item = item;

          return opt;
        });

        setOptions(mapped);
      } else {
        setOptions([]);
      }
    } finally {
      setLoading(false);
    }
  }, [endpoint, keep, mapLabel]);

  useEffect(() => {
    load();
  }, [load]);

  return { options, loading };
}
import { useEffect, useState } from "react";
import { api } from "../services/apiClient";

export default function useCatalog(endpoint, { includeEmpty = true, emptyLabel = "Seleccione..." } = {}) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get(endpoint);
        if (!alive) return;

        if (res.ok) {
          const mapped = (res.data || []).map((item) => ({
            value: String(item.id),
            label: item.name,
          }));
          setOptions(includeEmpty ? [{ value: "", label: emptyLabel }, ...mapped] : mapped);
        } else {
          setOptions(includeEmpty ? [{ value: "", label: emptyLabel }] : []);
        }
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    return () => { alive = false; };
  }, [endpoint, includeEmpty, emptyLabel]);

  return { options, loading };
}

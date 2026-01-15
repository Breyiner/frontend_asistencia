import { useEffect, useState } from "react";
import { api } from "../services/apiClient";

export default function useDataList({ endpoint, initialFilters = {} }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    page: 1,
    per_page: 10,
    ...initialFilters,
  });

  useEffect(() => {
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const cleanFilters = Object.fromEntries(
          Object.entries(filters).filter(([_, v]) => v !== '' && v !== null)
        );
        const params = new URLSearchParams(cleanFilters);
        const url = `${endpoint}${params.toString() ? `?${params}` : ''}`;

        const res = await api.get(url);

        if (res.ok) {
          setData(res.data || []);
          setTotal(res.paginate?.total || 0);
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint, filters]);

  return { data, loading, total, filters, setFilters };
}

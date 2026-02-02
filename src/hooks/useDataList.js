import { useState, useEffect, useCallback } from "react";
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

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          params.append(key, value);
        }
      });

      const res = await api.get(`${endpoint}?${params.toString()}`);

      if (res.ok) {
        setData(res.data || []);
        setTotal(res.paginate?.total || 0);
      } else {
        setData([]);
        setTotal(0);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [endpoint, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    total,
    filters,
    setFilters,
    refetch,
  };
}
import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../services/apiClient";
import { toDayLabels } from "../utils/dateUtils";

const STATUS_UI = {
  present: { code: "present", label: "Asistencia" },
  absent: { code: "absent", label: "Inasistencia" },
  late: { code: "late", label: "Tardanza" },
  excused_absence: { code: "excused_absence", label: "Justificada" },
  early_exit: { code: "early_exit", label: "Salida anticipada" },
  unregistered: { code: "unregistered", label: "Sin registrar" },
  no_class_day: { code: "no_class_day", label: "Sin clase" },
};

export default function useAttendanceRegister(fichaId) {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(2);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [payload, setPayload] = useState(null);

  const loadRegister = useCallback(async () => {
    setLoading(true);
    setError("");

    const endpoint = `attendances/monthly_register?ficha_id=${fichaId}&year=${year}&month=${month}`;

    try {
      const res = await api.get(endpoint);

      if (!res.ok) {
        setError(res.message || "Error cargando registro");
        setPayload(null);
        return;
      }

      setPayload(res.data);
    } catch (err) {
      setError("Error de conexión");
      setPayload(null);
    } finally {
      setLoading(false);
    }
  }, [fichaId, year, month]);

  useEffect(() => {
    loadRegister();
  }, [loadRegister]);

  const reload = () => loadRegister();

  const data = payload || null;
  const legend = data?.legend || {};
  const summary = payload?.summary || {};

  const dayInfoByDate = useMemo(() => {
    return data?.day_info_by_date || {};
  }, [data]);

  const days = useMemo(() => {
    const list = data?.days || [];
    return list.map((iso) => ({ iso, ...toDayLabels(iso) }));
  }, [data]);

  const slots = useMemo(() => {
    return data?.slots || [
      { code: "am", label: "Mañana" },
      { code: "pm", label: "Tarde" },
    ];
  }, [data]);

  const classesByKey = useMemo(() => {
    const m = new Map();
    const src = data?.classes_by_date_slot || {};

    Object.entries(src).forEach(([date, slotsData]) => {
      Object.entries(slotsData).forEach(([slotCode, classItems]) => {
        if (!Array.isArray(classItems) || classItems.length === 0) return;
        const classItem = classItems[0];
        m.set(`${date}__${slotCode}`, classItem);
      });
    });

    return m;
  }, [data]);

  const rows = useMemo(() => {
    const apprentices = data?.apprentices || [];

    return apprentices.map((a) => {
      const marksMap = new Map();
      const marksByDateSlot = a?.marks_by_date_slot || {};

      Object.entries(marksByDateSlot).forEach(([date, slotsData]) => {
        Object.entries(slotsData).forEach(([slotCode, markItems]) => {
          if (!Array.isArray(markItems) || markItems.length === 0) return;
          const mark = markItems[0];
          marksMap.set(`${date}__${slotCode}`, mark);
        });
      });

      const cells = [];
      days.forEach((d) => {
        const dayState = dayInfoByDate?.[d.iso]?.day_state;
        const isNoClassDay = dayState === "no_class_day";
        const dayReasonName = dayInfoByDate?.[d.iso]?.reason?.name || null;

        slots.forEach((s) => {
          const key = `${d.iso}__${s.code}`;
          const classItem = classesByKey.get(key);
          const mark = marksMap.get(key);          

          const statusCode = isNoClassDay ? "no_class_day" : (mark?.status || "unregistered");
          const status = STATUS_UI[statusCode] || STATUS_UI.unregistered;

          const classInfo = (classItem || isNoClassDay) ? {
            date: classItem?.display_date || classItem?.execution_date || d.iso,
            shift: s.label,
            start: classItem?.real_time?.start_hour || "—",
            end: classItem?.real_time?.end_hour || "—",
            instructor: classItem?.instructor?.full_name || "—",
            classType: classItem?.class_type?.name || (isNoClassDay ? "Sin clase" : "—"),
            classroom: classItem?.classroom?.name || "—",
            statusLabel: isNoClassDay
              ? (dayReasonName ? `Sin clase (${dayReasonName})` : (legend?.no_class_day || "Sin clase"))
              : (legend?.[statusCode] || status.label),
            absent_hours: isNoClassDay
              ? "—"
              : (mark?.absent_hours || 0),
            observations: isNoClassDay
              ? (dayInfoByDate?.[d.iso]?.observations || "—")
              : (mark?.observations || classItem?.observations || "—"),
          } : null;

          cells.push({
            dayIso: d.iso,
            shift: s.code,
            status,
            classInfo,
          });
        });
      });

      const fullName = a?.full_name || `Aprendiz ${a?.id}`;
      return {
        apprentice: {
          id: a.id,
          name: fullName,
          initials: (fullName || "?")
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map((x) => x[0]?.toUpperCase())
            .join(""),
        },
        cells,
      };
    });
  }, [data, days, slots, classesByKey, legend, dayInfoByDate]);

  return {
    payload,
    loading,
    error,
    year,
    setYear,
    month,
    setMonth,
    reload,
    legend,
    summary,
    rows,
    days,
    slots,
  };
}
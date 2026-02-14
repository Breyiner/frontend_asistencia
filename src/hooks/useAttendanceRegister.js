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

  const exportRegister = useCallback(async () => {
    const endpoint = `attendances/file/export?ficha_id=${fichaId}&year=${year}&month=${month}`;

    try {
      // Usar la función downloadFile del apiClient
      const result = await api.downloadFile(endpoint);

      if (!result.ok || !result.blob) {
        throw new Error(result.message || "Error al exportar el registro");
      }

      // Crear un nombre de archivo descriptivo
      const fileName = `Registro_Asistencias_Ficha${fichaId}_${year}-${String(month).padStart(2, "0")}.xlsx`;

      // Crear un link temporal y descargarlo
      const url = window.URL.createObjectURL(result.blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (err) {
      console.error("Error exportando:", err);
      return { success: false, error: err.message };
    }
  }, [fichaId, year, month]);

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
    return (
      data?.slots || [
        { code: "am", label: "Mañana" },
        { code: "pm", label: "Tarde" },
      ]
    );
  }, [data]);

  /**
   * NUEVO: columnas expandidas.
   * - Por cada día y por cada slot, creamos N columnas = max(1, clasesEnEseSlot).
   * - Esto permite que en el header salga: Mañana, Mañana, Tarde... cuando aplique.
   */
  const columns = useMemo(() => {
    const src = data?.classes_by_date_slot || {};
    const cols = [];

    days.forEach((d) => {
      const slotsData = src?.[d.iso] || {};

      slots.forEach((s) => {
        const classItems = Array.isArray(slotsData?.[s.code]) ? slotsData[s.code] : [];
        const count = Math.max(1, classItems.length);

        for (let i = 0; i < count; i++) {
          cols.push({
            dayIso: d.iso,
            slotCode: s.code,
            slotLabel: s.label,
            index: i,
            classItem: classItems[i] || null,
          });
        }
      });
    });

    return cols;
  }, [data, days, slots]);

  /**
   * NUEVO: colSpan por día (para el header superior).
   */
  const dayColSpan = useMemo(() => {
    const map = new Map();
    columns.forEach((c) => {
      map.set(c.dayIso, (map.get(c.dayIso) || 0) + 1);
    });
    return map;
  }, [columns]);

  /**
   * (Opcional) Mantengo tu classesByKey original, pero ya no se usa para render.
   * Si quieres, lo puedes borrar; lo dejo para no "mover" más de lo necesario.
   */
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

  /**
   * CAMBIO: rows ahora genera celdas en el orden de columns.
   * - Para marks, toma marks_by_date_slot[date][slot][index].
   * - classInfo sale de columns[i].classItem, no del primero.
   */
  const rows = useMemo(() => {
    const apprentices = data?.apprentices || [];

    return apprentices.map((a) => {
      const marksByDateSlot = a?.marks_by_date_slot || {};

      const cells = columns.map((col) => {
        const dayState = dayInfoByDate?.[col.dayIso]?.day_state;
        const isNoClassDay = dayState === "no_class_day";
        const dayReasonName = dayInfoByDate?.[col.dayIso]?.reason?.name || null;

        const markItemsRaw = marksByDateSlot?.[col.dayIso]?.[col.slotCode];
        const markItems = Array.isArray(markItemsRaw) ? markItemsRaw : [];
        const mark = markItems[col.index] || null;

        const statusCode = isNoClassDay
          ? "no_class_day"
          : mark?.status || "unregistered";

        const status = STATUS_UI[statusCode] || STATUS_UI.unregistered;

        const classItem = col.classItem;

        const classInfo =
          classItem || isNoClassDay
            ? {
                date: classItem?.display_date || classItem?.execution_date || col.dayIso,
                shift: col.slotLabel,
                start: classItem?.real_time?.start_hour || "—",
                end: classItem?.real_time?.end_hour || "—",
                instructor: classItem?.instructor?.full_name || "—",
                classType:
                  classItem?.class_type?.name || (isNoClassDay ? "Sin clase" : "—"),
                classroom: classItem?.classroom?.name || "—",
                statusLabel: isNoClassDay
                  ? dayReasonName
                    ? `Sin clase (${dayReasonName})`
                    : legend?.no_class_day || "Sin clase"
                  : legend?.[statusCode] || status.label,
                absent_hours: isNoClassDay ? "—" : mark?.absent_hours || 0,
                observations: isNoClassDay
                  ? dayInfoByDate?.[col.dayIso]?.observations || "—"
                  : mark?.observations || classItem?.observations || "—",
              }
            : null;

        return {
          colKey: `${col.dayIso}__${col.slotCode}__${col.index}`,
          dayIso: col.dayIso,
          shift: col.slotCode,
          status,
          classInfo,
        };
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
  }, [data, columns, dayInfoByDate, legend]);

  return {
    payload,
    loading,
    error,
    year,
    setYear,
    month,
    setMonth,
    reload,
    exportRegister,
    legend,
    summary,
    rows,
    days,
    slots,
    columns,
    dayColSpan,
  };
}
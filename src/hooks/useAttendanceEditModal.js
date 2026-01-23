import { useCallback, useMemo, useState } from "react";
import { api } from "../services/apiClient";
import { validarCamposReact } from "../utils/validators";
import { error, success } from "../utils/alertas";

function normalizeTime(t) {
  if (!t) return "";
  return String(t).slice(0, 5);
}

const RULES_BY_CODE = {
  present: { requiresDescription: false, requiresEntryHour: false },
  absent: { requiresDescription: false, requiresEntryHour: false },
  excused_absence: { requiresDescription: true, requiresEntryHour: false },
  early_exit: { requiresDescription: true, requiresEntryHour: false },
  late: { requiresDescription: false, requiresEntryHour: true },
  unregistered: { requiresDescription: false, requiresEntryHour: false },
};

export default function useAttendanceEditModal({
  statuses,
  setAttendances,
  setSummary,
  refetchAttendances,
}) {
  const [open, setOpen] = useState(false);
  const [attendance, setAttendance] = useState(null);

  const [form, setForm] = useState({
    attendance_status_id: "",
    entry_hour: "",
    observations: "",
    absent_hours: "",
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const selectedStatus = useMemo(() => {
    const id = Number(form.attendance_status_id);
    if (!id) return null;
    return statuses?.find((s) => Number(s.id) === id) || null;
  }, [statuses, form.attendance_status_id]);

  const rules = useMemo(() => {
    const code = selectedStatus?.code || "unregistered";
    return RULES_BY_CODE[code] || RULES_BY_CODE.unregistered;
  }, [selectedStatus?.code]);

  const schema = useMemo(() => {
    return [
      { name: "attendance_status_id", type: "select", required: true },
      { name: "entry_hour", type: "time", required: !!rules.requiresEntryHour },
      { name: "observations", type: "text", required: !!rules.requiresDescription, maxLength: 500 },
    ];
  }, [rules]);

  const openModal = useCallback((att) => {
    setAttendance(att);
    setErrors({});

    setForm({
      attendance_status_id: att?.attendance_status?.id ? String(att.attendance_status.id) : "",
      entry_hour: normalizeTime(att?.entry_hour),
      observations: att?.observations || "",
      absent_hours: att?.absent_hours != null ? String(att.absent_hours) : "",
    });

    setOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    if (saving) return;
    setOpen(false);
    setAttendance(null);
    setErrors({});
  }, [saving]);

  const onChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    },
    [errors]
  );

  const pickStatusId = useCallback(
    (id) => {
      setForm((prev) => ({ ...prev, attendance_status_id: String(id) }));
      if (errors.attendance_status_id) {
        setErrors((prev) => ({ ...prev, attendance_status_id: "" }));
      }
    },
    [errors.attendance_status_id]
  );

  const save = useCallback(async () => {
    const result = validarCamposReact(form, schema);
    if (!result.ok) {
      setErrors(result.errors || {});
      return false;
    }

    if (!attendance?.id) {
      await error("No hay asistencia seleccionada.");
      return false;
    }

    try {
      setSaving(true);

      const statusId = Number(form.attendance_status_id);
      const payload = {
        attendance_status_id: statusId,
        entry_hour: form.entry_hour || null,
        observations: form.observations?.trim() ? form.observations.trim() : null,
      };

      const picked = statuses?.find((s) => Number(s.id) === statusId) || null;

      setAttendances?.((curr) =>
        curr.map((a) =>
          a.id === attendance.id
            ? {
                ...a,
                entry_hour: payload.entry_hour,
                observations: payload.observations,
                attendance_status: picked
                  ? { id: picked.id, code: picked.code, name: picked.name }
                  : a.attendance_status,
              }
            : a
        )
      );

      const res = await api.patch(`attendances/${attendance.id}`, payload);

      if (!res.ok) {
        await error(res.message || "No se pudo guardar la asistencia.");
        await refetchAttendances?.();
        return false;
      }

      setOpen(false);
      await success(res.message || "Asistencia actualizada.");

      if (res.summary) setSummary?.(res.summary);

      const computedId = res.data?.id;
      const computed = res.data?.computed;

      if (computedId && computed) {
        setAttendances?.((curr) =>
          curr.map((a) =>
            a.id === computedId
              ? {
                  ...a,
                  entry_hour: computed.entry_hour,
                  absent_hours: computed.absent_hours,
                }
              : a
          )
        );
      }

      return true;
    } catch (e) {
      await error(e?.message || "Error de conexión.");
      await refetchAttendances?.();
      return false;
    } finally {
      setSaving(false);
    }
  }, [attendance?.id, form, refetchAttendances, schema, setAttendances, setSummary, statuses]);

  return {
    open,
    attendance,
    form,
    errors,
    saving,
    rules,
    selectedStatus,
    openModal,
    closeModal,
    onChange,
    pickStatusId,
    save,
  };
}
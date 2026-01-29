import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api } from "../services/apiClient";
import { validarCamposReact } from "../utils/validators";
import { success, error } from "../utils/alertas";

const sessionSchema = [
  { name: "day_id", type: "select", required: true },
  { name: "time_slot_id", type: "select", required: true },
  { name: "start_time", type: "text", required: true },
  { name: "end_time", type: "text", required: true },
  { name: "instructor_id", type: "select", required: true },
  { name: "classroom_id", type: "select", required: true },
];

export default function useSessionScheduleCreate() {
  const { fichaId, fichaTermId, scheduleId } = useParams();

  const [schedule, setSchedule] = useState(null);
  const [form, setForm] = useState({
    day_id: "",
    time_slot_id: "",
    start_time: "",
    end_time: "",
    instructor_id: "",
    classroom_id: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!scheduleId) return;

    const fetchSchedule = async () => {
      try {
        const res = await api.get(`schedules/${scheduleId}`);
        if (res.ok) setSchedule(res.data);
      } catch (e) {
        console.error("Error schedule:", e);
      }
    };

    fetchSchedule();
  }, [scheduleId]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateAndSave = async () => {
    const result = validarCamposReact(form, sessionSchema);
    if (!result.ok) {
      setErrors(result.errors || {});
      return false;
    }

    try {
      setLoading(true);

      const payload = {
        schedule_id: Number(scheduleId),
        day_id: Number(form.day_id),
        time_slot_id: Number(form.time_slot_id),
        start_time: form.start_time,
        end_time: form.end_time,
        instructor_id: Number(form.instructor_id),
        classroom_id: Number(form.classroom_id),
      };

      const res = await api.post(`schedule_sessions`, payload);
      if (!res.ok) {
        await error(res.message || "No se pudo asignar el día.");
        return false;
      }

      await success(res.message || "Día asignado con éxito.");
      return { ok: true };
    } catch (e) {
      await error(e?.message || "Error de conexión.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    fichaId,
    fichaTermId,
    scheduleId,
    schedule,
    form,
    errors,
    loading,
    onChange,
    validateAndSave,
  };
}
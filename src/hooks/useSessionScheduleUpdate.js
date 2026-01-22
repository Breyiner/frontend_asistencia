import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api } from "../services/apiClient";
import { validarCamposReact } from "../utils/validators";
import { success, error } from "../utils/alertas";

const sessionSchema = [
  { name: "day_id", type: "select", required: true },
  { name: "shift_id", type: "select", required: true },
  { name: "start_time", type: "text", required: true },
  { name: "end_time", type: "text", required: true },
  { name: "instructor_id", type: "select", required: true },
  { name: "classroom_id", type: "select", required: true },
];

function mapSessionToForm(session) {
  if (!session) {
    return {
      day_id: "",
      shift_id: "",
      start_time: "",
      end_time: "",
      instructor_id: "",
      classroom_id: "",
    };
  }

  return {
    day_id: session.day?.id ? String(session.day.id) : "",
    shift_id: session.shift?.id ? String(session.shift.id) : "",
    start_time: session.start_time || "",
    end_time: session.end_time || "",
    instructor_id: session.instructor?.id ? String(session.instructor.id) : "",
    classroom_id: session.classroom?.id ? String(session.classroom.id) : "",
  };
}

export default function useSessionScheduleUpdate() {
  const { fichaId, fichaTermId, scheduleId, sessionId } = useParams();

  const [schedule, setSchedule] = useState(null);
  const [session, setSession] = useState(null);
  const [form, setForm] = useState(mapSessionToForm(null));
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

  useEffect(() => {
    if (!schedule || !sessionId) return;
    const found = schedule.sessions?.find((s) => String(s.id) === String(sessionId));
    setSession(found || null);
    setForm(mapSessionToForm(found || null));
  }, [schedule, sessionId]);

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
        shift_id: Number(form.shift_id),
        start_time: form.start_time,
        end_time: form.end_time,
        instructor_id: Number(form.instructor_id),
        classroom_id: Number(form.classroom_id),
      };

      const res = await api.patch(`schedule_sessions/${sessionId}`, payload);

      if (!res.ok) {
        await error(res.message || "No se pudo actualizar el día.");
        return false;
      }

      await success(res.message || "Día actualizado con éxito.");
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
    sessionId,
    schedule,
    session,
    form,
    errors,
    loading,
    onChange,
    validateAndSave,
  };
}

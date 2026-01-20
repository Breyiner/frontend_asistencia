
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api } from "../services/apiClient";
import { validarCamposReact } from "../utils/validators";
import { success, error } from "../utils/alertas";

const fichaTermSchema = [
  { name: "term_id", type: "select", required: true },
  { name: "phase_id", type: "select", required: true },
  { name: "start_date", type: "date", required: true },
  { name: "end_date", type: "date", required: true },
];

export default function useFichaTermCreate() {
  const { fichaId } = useParams();
  const [form, setForm] = useState({
    term_id: "",
    phase_id: "",
    start_date: "",
    end_date: "",
  });
  const [ficha, setFicha] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (fichaId) {
      const fetchFicha = async () => {
        try {
          const res = await api.get(`fichas/${fichaId}`);
          if (res.ok) setFicha(res.data);
        } catch (e) {
          console.error("Error ficha:", e);
        }
      };
      fetchFicha();
    }
  }, [fichaId]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateAndSave = async () => {
    const result = validarCamposReact(form, fichaTermSchema);
    if (!result.ok) {
      setErrors(result.errors || {});
      return false;
    }

    try {
      setLoading(true);
      const payload = {
        ficha_id: Number(fichaId),
        term_id: Number(form.term_id),
        phase_id: Number(form.phase_id),
        start_date: form.start_date,
        end_date: form.end_date,
      };

      const res = await api.post("ficha_terms", payload);

      if (!res.ok) {
        await error(res.message || "No se pudo asociar el trimestre.");
        return false;
      }

      await success(res.message || "¡Trimestre asociado con éxito!");
      return { ok: true };
    } catch (e) {
      await error(e?.message || "Error de conexión.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { form, ficha, fichaId, errors, loading, onChange, validateAndSave };
}
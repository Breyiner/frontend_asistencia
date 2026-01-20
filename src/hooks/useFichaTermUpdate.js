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

export default function useFichaTermUpdate() {
  const { fichaId, fichaTermId } = useParams();

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
    if (!fichaId) return;

    const fetchFicha = async () => {
      try {
        const res = await api.get(`fichas/${fichaId}`);
        if (res.ok) setFicha(res.data);
      } catch (e) {
        console.error("Error ficha:", e);
      }
    };

    fetchFicha();
  }, [fichaId]);
  
  useEffect(() => {
    if (!fichaTermId) return;

    const fetchFichaTerm = async () => {
      try {
        setLoading(true);

        const res = await api.get(`ficha_terms/${fichaTermId}`);

        if (!res.ok) return;

        const item = res.data;

        setForm({
          term_id: item.term_id ? String(item.term_id) : "",
          phase_id: item.phase_id ? String(item.phase_id) : "",
          start_date: item.start_date || "",
          end_date: item.end_date || "",
        });
      } catch (e) {
        console.error("Error ficha_term:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchFichaTerm();
  }, [fichaTermId]);

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
        term_id: Number(form.term_id),
        phase_id: Number(form.phase_id),
        start_date: form.start_date,
        end_date: form.end_date,
      };

      const res = await api.patch(`ficha_terms/${fichaTermId}`, payload);

      if (!res.ok) {
        await error(res.message || "No se pudo actualizar el trimestre.");
        return false;
      }

      await success(res.message || "¡Trimestre actualizado con éxito!");
      return { ok: true };
    } catch (e) {
      await error(e?.message || "Error de conexión.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { form, ficha, fichaId, fichaTermId, errors, loading, onChange, validateAndSave };
}
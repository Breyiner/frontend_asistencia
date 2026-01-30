import { useEffect, useState, useCallback } from "react";
import { api } from "../services/apiClient";
import { validarCamposReact } from "../utils/validators";
import { success, error, confirm } from "../utils/alertas";
import { useNavigate } from "react-router-dom";

const fichaSchema = [
    { name: "ficha_number", type: "text", required: true, maxLength: 20 },
    { name: "training_program_id", type: "select", required: true },
    { name: "gestor_id", type: "select", required: true },
    { name: "shift_id", type: "select", required: true },
    { name: "start_date", type: "date", required: true },
    { name: "end_date", type: "date", required: true },
    { name: "status_id", type: "select", required: true },
];

function mapFichaToForm(ficha) {
    return {
        ficha_number: ficha?.ficha_number || "",
        training_program_id: ficha?.training_program_id ? String(ficha.training_program_id) : "",
        gestor_id: ficha?.gestor_id ? String(ficha.gestor_id) : "",
        shift_id: ficha?.shift_id ? String(ficha.shift_id) : "",
        start_date: ficha?.start_date || "",
        end_date: ficha?.end_date || "",
        status_id: ficha?.status_id ? String(ficha.status_id) : "",
    };
}

export default function useFichaShow(id) {
    const navigate = useNavigate();
    const [ficha, setFicha] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState(mapFichaToForm(null));
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const fetchFicha = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const res = await api.get(`fichas/${id}`);
            console.log(res);
            
            setFicha(res.ok ? res.data : null);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchFicha();
    }, [fetchFicha]);

    useEffect(() => {
        if (!ficha) return;
        setForm(mapFichaToForm(ficha));
    }, [ficha, isEditing]);

    const startEdit = useCallback(() => {
        setIsEditing(true);
        setErrors({});
    }, []);

    const cancelEdit = useCallback(() => {
        setIsEditing(false);
        setErrors({});
        setForm(mapFichaToForm(ficha));
    }, [ficha]);

    const onChange = useCallback(
        (e) => {
            const { name, value } = e.target;
            setForm((prev) => ({ ...prev, [name]: value }));
            if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
        },
        [errors],
    );

    const save = useCallback(async () => {
        const result = validarCamposReact(form, fichaSchema);
        if (!result.ok) {
            setErrors(result.errors || {});
            return false;
        }

        try {
            setSaving(true);

            const payload = {
                ficha_number: form.ficha_number?.trim(),
                training_program_id: form.training_program_id ? Number(form.training_program_id) : null,
                gestor_id: form.gestor_id ? Number(form.gestor_id) : null,
                shift_id: form.shift_id ? Number(form.shift_id) : null,
                start_date: form.start_date || null,
                end_date: form.end_date || null,
                status_id: form.status_id ? Number(form.status_id) : null,
            };

            const res = await api.patch(`fichas/${id}`, payload);

            if (!res.ok) {
                await error(res.message || "No se pudo actualizar la ficha.");
                return false;
            }

            await success(res.message || "Ficha actualizada con éxito.");
            setIsEditing(false);
            await fetchFicha();
            return true;
        } catch (e) {
            await error(e?.message || "Error de conexión.");
            return false;
        } finally {
            setSaving(false);
        }
    }, [form, id, fetchFicha]);

    const deleteFicha = useCallback(async () => {
        const confirmed = await confirm("¿Eliminar esta ficha permanentemente?");
        if (!confirmed.isConfirmed) return false;

        try {
            setSaving(true);
            const res = await api.delete(`fichas/${id}`);
            if (!res.ok) {
                await error(res.message || "No se pudo eliminar.");
                return false;
            }
            await success("Ficha eliminada!");
            navigate("/fichas");
            return true;
        } catch (e) {
            await error(e?.message || "Error al eliminar.");
            return false;
        } finally {
            setSaving(false);
        }
    }, [id, navigate]);

    const setCurrentTerm = useCallback(
        async (fichaTermId) => {
            try {
                setSaving(true);
                const res = await api.patch(`ficha_terms/${fichaTermId}/set_current`);
                if (!res.ok) {
                    await error(res.message || "No se pudo establecer como actual.");
                    return false;
                }
                await success(res.message || "Trimestre marcado como actual.");
                await fetchFicha();
                return true;
            } catch (e) {
                await error(e?.message || "Error de conexión.");
                return false;
            } finally {
                setSaving(false);
            }
        },
        [fetchFicha],
    );

    const deleteFichaTerm = useCallback(
        async (fichaTermId) => {
            const confirmed = await confirm("¿Eliminar este trimestre asociado?");
            if (!confirmed.isConfirmed) return false;

            try {
                setSaving(true);
                const res = await api.delete(`ficha_terms/${fichaTermId}`);
                if (!res.ok) {
                    await error(res.message || "No se pudo eliminar.");
                    return false;
                }
                await success(res.message || "Trimestre eliminado.");
                await fetchFicha();
                return true;
            } catch (e) {
                await error(e?.message || "Error de conexión.");
                return false;
            } finally {
                setSaving(false);
            }
        },
        [fetchFicha],
    );

    return {
        ficha,
        loading,
        isEditing,
        form,
        errors,
        saving,
        startEdit,
        cancelEdit,
        onChange,
        save,
        deleteFicha,
        refetch: fetchFicha,
        setCurrentTerm,
        deleteFichaTerm,
    };
}

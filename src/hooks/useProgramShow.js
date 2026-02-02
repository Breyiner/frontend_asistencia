import { useEffect, useState, useCallback } from "react";
import { api } from "../services/apiClient";
import { validarCamposReact } from "../utils/validators";
import { success, error, confirm } from "../utils/alertas";
import { useNavigate } from "react-router-dom";

const programUpdateSchema = [
    { name: "name", type: "text", required: true, maxLength: 80 },
    { name: "duration", type: "text", required: true, minLength: 1, maxLength: 2 },
    { name: "qualification_level_id", type: "select", required: true },
    { name: "area_id", type: "select", required: true },
    { name: "coordinator_id", type: "select", required: true },
    { name: "description", type: "text", minLength: 10, maxLength: 100 },
];

function mapProgramToForm(program) {
    return {
        name: program?.name || "",
        duration: program?.duration || "",
        qualification_level_id: program?.qualification_level_id ? String(program.qualification_level_id) : "",
        area_id: program?.area_id ? String(program.area_id) : "",
        coordinator_id: program?.coordinator_id ? String(program.coordinator_id) : "",
        description: program?.description || "",
    };
}

export default function useProgramShow(id) {
    const navigate = useNavigate();
    const [program, setProgram] = useState(null);
    const [loading, setLoading] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState(mapProgramToForm(null));
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const fetchProgram = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const res = await api.get(`training_programs/${id}`);
            setProgram(res.ok ? res.data : null);

            if (!res.ok) setIsEditing(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProgram();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    useEffect(() => {
        if (!program) return;
        if (!isEditing) setForm(mapProgramToForm(program));
    }, [program, isEditing]);

    const startEdit = useCallback(() => {
        setIsEditing(true);
        setErrors({});
        setForm(mapProgramToForm(program));
    }, [program]);

    const cancelEdit = () => {
        setIsEditing(false);
        setErrors({});
        setForm(mapProgramToForm(program));
    };

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const save = async () => {
        const result = validarCamposReact(form, programUpdateSchema);
        if (!result.ok) {
            setErrors(result.errors || {});
            return false;
        }

        try {
            setSaving(true);

            const payload = {
                name: form.name?.trim(),
                duration: form.duration ? Number(form.duration) : null,
                qualification_level_id: form.qualification_level_id ? Number(form.qualification_level_id) : null,
                area_id: form.area_id ? Number(form.area_id) : null,
                coordinator_id: form.coordinator_id ? Number(form.coordinator_id) : null,
                description: form.description?.trim(),
            };

            const res = await api.patch(`training_programs/${id}`, payload);

            if (!res.ok) {
                await error(res.message || "No se pudo actualizar el programa.");
                return false;
            }

            await success(res.message || "Programa actualizado con éxito.");
            setIsEditing(false);
            await fetchProgram();
            return true;
        } catch (e) {
            await error(e?.message || "Error de conexión. Intenta de nuevo.");
            return false;
        } finally {
            setSaving(false);
        }
    };

    const deleteProgram = async () => {
        const confirmed = await confirm("¿Eliminar este programa permanentemente?");
        if (!confirmed.isConfirmed) return false;

        try {
            setSaving(true);
            const res = await api.delete(`training_programs/${id}`);

            if (!res.ok) {
                await error(res.message || "No se pudo eliminar");
                return false;
            }

            await success("Programa eliminado!");
            navigate("/training_programs");
            return true;
        } catch (e) {
            await error(e?.message || "Error al eliminar");
            return false;
        } finally {
            setSaving(false);
        }
    };

    return {
        program,
        loading,
        isEditing,
        form,
        errors,
        saving,
        startEdit,
        cancelEdit,
        onChange,
        save,
        deleteProgram,
        refetch: fetchProgram,
    };
}
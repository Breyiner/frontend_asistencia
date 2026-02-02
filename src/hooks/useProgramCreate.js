import { useState } from "react";
import { api } from "../services/apiClient";
import { validarCamposReact } from "../utils/validators";
import { success, error } from "../utils/alertas";

const programCreateSchema = [
    { name: "name", type: "text", required: true, maxLength: 80 },
    { name: "duration", type: "text", required: true, minLength: 1, maxLength: 2 },
    { name: "qualification_level_id", type: "select", required: true },
    { name: "area_id", type: "select", required: true },
    { name: "coordinator_id", type: "select", required: true },
    { name: "description", type: "text", minLength: 10, maxLength: 100 },
];

export default function useProgramCreate() {
    const [form, setForm] = useState({
        name: "",
        duration: "",
        qualification_level_id: "",
        area_id: "",
        coordinator_id: "",
        description: "",
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const validateAndSave = async () => {
        const result = validarCamposReact(form, programCreateSchema);
        if (!result.ok) {
            setErrors(result.errors || {});
            return false;
        }

        try {
            setLoading(true);

            const payload = {
                name: form.name?.trim(),
                duration: form.duration ? Number(form.duration) : null,
                qualification_level_id: form.qualification_level_id ? Number(form.qualification_level_id) : null,
                area_id: form.area_id ? Number(form.area_id) : null,
                coordinator_id: form.coordinator_id ? Number(form.coordinator_id) : null,
                description: form.description?.trim(),
            };

            const res = await api.post("training_programs", payload);

            if (!res.ok) {
                await error(res.message || "No se pudo crear el programa.");
                return false;
            }

            const createdId = res?.data?.id ?? res?.data?.data?.id ?? null;

            await success(res.message || "Programa creado con éxito.");
            return { ok: true, createdId };
        } catch (e) {
            console.error(e);
            await error(e?.message || "Error de conexión. Intenta de nuevo.");
            return false;
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setForm({
            name: "",
            duration: "",
            qualification_level_id: "",
            area_id: "",
            coordinator_id: "",
            description: "",
        });
        setErrors({});
    };

    return {
        form,
        errors,
        loading,
        onChange,
        validateAndSave,
        resetForm,
    };
}
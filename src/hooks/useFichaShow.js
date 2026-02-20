import { useEffect, useState, useCallback } from "react";
import { api } from "../services/apiClient";
import { validarCamposReact } from "../utils/validators";
import { success, error, confirm } from "../utils/alertas";
import { useNavigate } from "react-router-dom";

/**
 * Schema para **edición** de fichas (igual que creación + status_id).
 *
 * Diferencia clave: status_id para cambiar estado (activa/inactiva)
 *
 * @constant
 * @type {Array<Object>}
 */
const fichaSchema = [
  { name: "ficha_number", type: "text", required: true, maxLength: 20 },
  { name: "training_program_id", type: "select", required: true },
  { name: "gestor_id", type: "select", required: true },
  { name: "shift_id", type: "select", required: true },
  { name: "start_date", type: "date", required: true },
  { name: "end_date", type: "date", required: true },
  // ADICIONAL en edición: estado de la ficha
  { name: "status_id", type: "select", required: true },
];

/**
 * Mapea datos de ficha → formulario editable.
 *
 * Convierte IDs numéricos → strings (para <select>)
 * Maneja null/undefined → strings vacíos
 *
 * @param {Object|null} ficha - Datos crudos de la API
 * @returns {Object} Formato listo para inputs
 */
function mapFichaToForm(ficha) {
  return {
    ficha_number: ficha?.ficha_number || "",
    training_program_id: ficha?.training_program_id
      ? String(ficha.training_program_id)
      : "",
    gestor_id: ficha?.gestor_id ? String(ficha.gestor_id) : "",
    shift_id: ficha?.shift_id ? String(ficha.shift_id) : "",
    start_date: ficha?.start_date || "",
    end_date: ficha?.end_date || "",
    status_id: ficha?.status_id ? String(ficha.status_id) : "",
  };
}

/**
 * Hook completo para **ver/editar/eliminar** una ficha específica.
 */
export default function useFichaShow(id) {
  const navigate = useNavigate(); // Navegación programática

  // Datos originales de la ficha desde API
  const [ficha, setFicha] = useState(null);
  const [loading, setLoading] = useState(false); // Carga inicial

  // Modo edición vs vista
  const [isEditing, setIsEditing] = useState(false);

  // Formulario editable
  const [form, setForm] = useState(mapFichaToForm(null));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false); // Guardar/eliminar

  /**
   * Carga ficha específica desde API.
   *
   * GET fichas/{id}
   *
   * Maneja !id → no hace nada (montaje inicial)
   *
   * useCallback optimizado con [id]
   */
  const fetchFicha = useCallback(async () => {
    if (!id) return; // Previene llamadas sin ID válido
    setLoading(true); // Spinner inicial

    try {
      const res = await api.get(`fichas/${id}`);

      // Si res.ok guarda datos, sino null
      setFicha(res.ok ? res.data : null);
    } finally {
      setLoading(false); // Spinner off
    }
  }, [id]);

  // Carga automática al cambiar ID
  useEffect(() => {
    fetchFicha();
  }, [fetchFicha]);

  // Sincroniza formulario con datos originales
  useEffect(() => {
    if (!ficha) return;
    // En modo edición mantiene cambios del usuario
    setForm(mapFichaToForm(ficha));
  }, [ficha, isEditing]);

  /**
   * Activa modo edición.
   *
   * Limpia errores previos para UX limpia.
   */
  const startEdit = useCallback(() => {
    setIsEditing(true);
    setErrors({});
  }, []);

  /**
   * Cancela edición → restaura datos originales.
   */
  const cancelEdit = useCallback(() => {
    setIsEditing(false);
    setErrors({});
    setForm(mapFichaToForm(ficha)); // Restaura original
  }, [ficha]);

  /**
   * Handler cambios formulario.
   *
   * useCallback con [errors] para limpiar errores específicos.
   */
  const onChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    },
    [errors],
  );

  /**
   * Guarda cambios con PATCH.
   *
   * Proceso:
   * 1. Validación schema
   * 2. Payload tipado
   * 3. PATCH fichas/{id}
   * 4. Recarga datos originales
   * 5. Sale modo edición
   */
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
        training_program_id: form.training_program_id
          ? Number(form.training_program_id)
          : null,
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
      setIsEditing(false); // Vuelve a modo vista
      await fetchFicha(); // Recarga datos frescos
      return true;
    } catch (e) {
      await error(e?.message || "Error de conexión.");
      return false;
    } finally {
      setSaving(false);
    }
  }, [form, id, fetchFicha]);

  /**
   * Elimina la ficha con DELETE.
   *
   * Proceso:
   * 1. Confirmación usuario
   * 2. DELETE fichas/{id}
   * 3. Redirige a listado
   */
  const deleteFicha = useCallback(async () => {
    const confirmed = await confirm(
      "¿Eliminar esta ficha? Esta acción no se puede deshacer.",
    );
    if (!confirmed) return false;

    try {
      setSaving(true);
      const res = await api.delete(`fichas/${id}`);

      if (!res.ok) {
        await error(res.message || "No se pudo eliminar la ficha.");
        return false;
      }

      await success(res.message || "Ficha eliminada con éxito.");
      navigate("/fichas"); // Redirige a listado
      return true;
    } catch (e) {
      await error(e?.message || "Error de conexión.");
      return false;
    } finally {
      setSaving(false);
    }
  }, [id, navigate]);

  /**
   * Elimina término específico de la ficha (placeholder)
   */
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

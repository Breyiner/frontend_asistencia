import { useState } from "react";
import { api } from "../services/apiClient";
import { validarCamposReact } from "../utils/validators";
import { success, error, info } from "../utils/alertas";

// Esquema de validación base para creación de usuario (campos individuales)
const userCreateSchema = [
  { name: "first_name",        type: "text", required: true,  maxLength: 80 },
  { name: "last_name",         type: "text", required: true,  maxLength: 80 },
  { name: "email",             type: "email", required: true, maxLength: 120 },
  { name: "telephone_number",  type: "text", required: true,  minLength: 7, maxLength: 20 },
  { name: "document_type_id",  type: "select", required: true },
  { name: "document_number",   type: "text", required: true,  minLength: 6, maxLength: 20 },
];

/**
 * Hook completo para la CREACIÓN de un nuevo usuario en el sistema.
 * 
 * Características principales:
 * - Manejo de formulario con campos individuales + multiselect para roles y áreas
 * - Validación cliente-side de campos obligatorios + validación adicional de arrays (roles y áreas)
 * - Construcción de payload con limpieza (trim) y conversión de tipos
 * - Envío POST a /users
 * - Mensaje informativo sobre activación por correo
 * - Retorno del ID creado para posibles acciones posteriores (redirigir a edición, etc.)
 */
export default function useUserCreate() {
  // Estado del formulario – strings para inputs, arrays para multiselect
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    telephone_number: "",
    document_type_id: "",
    document_number: "",
    status_id: "",           // Puede venir predefinido o vacío
    roles: [],               // Array de IDs seleccionados (strings desde <select multiple>)
    areas: [],               // Ídem para áreas
  });

  const [errors, setErrors] = useState({});   // { field: "mensaje" }
  const [loading, setLoading] = useState(false);

  /**
   * Manejador único para TODOS los cambios (inputs simples y multiselect)
   * Soporta tanto value simple como selectedOptions (para <select multiple>)
   */
  const onChange = (e) => {
    const { name, value, multiple, selectedOptions } = e.target;

    // Para multiselect: extraemos array de values seleccionados
    const nextValue = multiple
      ? Array.from(selectedOptions).map((opt) => opt.value)
      : value;

    setForm((prev) => ({ ...prev, [name]: nextValue }));

    // Limpieza reactiva: al modificar un campo → quitamos su error
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  /**
   * Valida formulario + arrays requeridos y envía creación a la API.
   * @returns {Promise<{ok: boolean, createdId?: number}> | false}
   */
  const validateAndSave = async () => {
    // Validación base de campos individuales
    const result = validarCamposReact(form, userCreateSchema);

    // Validaciones adicionales NO cubiertas por el schema (arrays obligatorios)
    const extraErrors = {};
    if (!form.roles || form.roles.length === 0) {
      extraErrors.roles = "Selecciona al menos un rol.";
    }
    if (!form.areas || form.areas.length === 0) {
      extraErrors.areas = "Selecciona al menos un área.";
    }

    // Combinamos errores del validador + extras
    const mergedErrors = { ...(result?.errors || {}), ...extraErrors };
    setErrors(mergedErrors);

    // Si hay cualquier error → salimos temprano
    if (!result.ok || Object.keys(extraErrors).length > 0) {
      return false;
    }

    try {
      setLoading(true);

      // Construcción cuidadosa del payload
      const payload = {
        first_name:       form.first_name?.trim() || "",
        last_name:        form.last_name?.trim() || "",
        email:            form.email?.trim() || "",
        telephone_number: form.telephone_number?.trim() || "",
        document_type_id: form.document_type_id ? Number(form.document_type_id) : null,
        document_number:  form.document_number?.trim() || "",
        roles:            (form.roles || []).map(Number),           // ["1","2"] → [1,2]
        area_ids:         (form.areas || []).map(Number),           // Renombrado a area_ids (convención backend)
      };

      const res = await api.post("users", payload);

      if (!res.ok) {
        await error(res.message || "No se pudo crear el usuario.");
        return false;
      }

      // Extraemos ID creado (maneja diferentes estructuras posibles del backend)
      const createdId =
        res?.data?.id ??
        res?.data?.user?.id ??
        res?.data?.data?.id ??
        null;

      await success(res.message || "Usuario creado con éxito.");

      // Mensaje importante: activación por email (no todos los usuarios lo saben)
      await info(
        "Indica al usuario que revise su correo electrónico para activar su cuenta " +
        "y acceder con las credenciales otorgadas."
      );

      return { ok: true, createdId };

    } catch (e) {
      console.error("[useUserCreate] Error al crear usuario:", e);
      await error(e?.message || "Error de conexión. Intenta de nuevo.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resetea TODO el formulario a valores iniciales y limpia errores
   * Útil tras éxito o cancelación manual
   */
  const resetForm = () => {
    setForm({
      first_name: "",
      last_name: "",
      email: "",
      telephone_number: "",
      document_type_id: "",
      document_number: "",
      status_id: "",
      roles: [],
      areas: [],
    });
    setErrors({});
  };

  return {
    form,             // Binding para inputs y selects
    errors,           // Mensajes de error por campo
    loading,          // Spinner / disabled en submit
    onChange,         // Handler único (soporta simple y multiple)
    validateAndSave,  // Acción principal: validar + guardar
    resetForm,        // Reset completo
  };
}
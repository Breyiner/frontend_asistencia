import { useState } from "react";
import { api } from "../services/apiClient";                  // Cliente HTTP autenticado
import { validarCamposReact } from "../utils/validators";   // Validador personalizado de campos
import { success, error } from "../utils/alertas";          // Alertas UI preconfiguradas

/**
 * Hook para la CREACIÓN de un nuevo rol en el sistema.
 * 
 * Propósito:
 * - Manejar formulario simple de rol (nombre, código único, descripción)
 * - Normalizar el código automáticamente (mayúsculas, espacios → _)
 * - Validación cliente-side
 * - Envío POST a /roles
 * - Retorno del ID creado para posibles redirecciones o acciones posteriores
 */
const roleCreateSchema = [
  { name: "name",        type: "text", required: true,  maxLength: 50 },
  { name: "code",        type: "text", required: true,  maxLength: 30 },
  { name: "description", type: "text", required: false, minLength: 3, maxLength: 255 },
];

/**
 * Normaliza el código del rol: mayúsculas + reemplaza espacios por _
 * Ej: "Admin Principal" → "ADMIN_PRINCIPAL"
 * @param {string} value - Valor ingresado por el usuario
 * @returns {string} Código limpio y normalizado
 */
function normalizeCode(value) {
  return (value || "")
    .trim()                     // Quita espacios al inicio/final
    .toUpperCase()              // Todo a mayúsculas (convención común para códigos)
    .replace(/\s+/g, "_");      // Reemplaza cualquier secuencia de espacios por un solo _
}

export default function useRoleCreate() {
  // Estado del formulario – todos strings
  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
  });

  // Errores por campo (clave = name del input)
  const [errors, setErrors] = useState({});

  // Indicador de envío en curso
  const [loading, setLoading] = useState(false);

  /**
   * Manejador de cambios en cualquier campo del formulario.
   * - Aplica normalización automática solo al campo "code"
   * - Limpia error del campo al escribir
   */
  const onChange = (e) => {
    const { name, value } = e.target;

    if (name === "code") {
      // Normalizamos en tiempo real para feedback inmediato al usuario
      setForm((prev) => ({ ...prev, code: normalizeCode(value) }));
    } else {
      // Resto de campos sin transformación
      setForm((prev) => ({ ...prev, [name]: value }));
    }

    // Limpieza reactiva: al escribir → quitar error de ese campo
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  /**
   * Valida y guarda el nuevo rol en la API.
   * @returns {Promise<{ok: boolean, createdId?: number}> | false}
   */
  const validateAndSave = async () => {
    // Validación con schema predefinido
    const result = validarCamposReact(form, roleCreateSchema);
    if (!result.ok) {
      setErrors(result.errors || {});
      return false;
    }

    try {
      setLoading(true);

      // Payload final con normalizaciones aplicadas nuevamente (por seguridad)
      const payload = {
        name:        form.name?.trim(),
        code:        normalizeCode(form.code),          // Aseguramos consistencia
        description: form.description?.trim() || null,  // "" → null en backend
      };

      const res = await api.post("roles", payload);

      if (!res.ok) {
        await error(res.message || "No se pudo crear el rol.");
        return false;
      }

      // Extraemos ID creado (puede venir en diferentes estructuras según backend)
      const createdId = res?.data?.id ?? null;

      await success(res.message || "Rol creado con éxito.");

      return { ok: true, createdId };   // Útil para redirigir a edición o lista

    } catch (e) {
      await error(e?.message || "Error de conexión. Intenta de nuevo.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resetea el formulario a valores iniciales y limpia errores
   */
  const resetForm = () => {
    setForm({ name: "", code: "", description: "" });
    setErrors({});
  };

  return {
    form,             // Para binding en inputs
    errors,           // Para mostrar mensajes debajo de campos
    loading,          // Para spinner / disabled en botón
    onChange,         // Handler único
    validateAndSave,  // Acción principal de guardar
    resetForm,        // Útil tras éxito o cancelación
  };
}
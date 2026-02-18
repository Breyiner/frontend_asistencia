import { useState } from "react";
import { api } from "../services/apiClient";
import { validarCamposReact } from "../utils/validators";
import { success, error } from "../utils/alertas";

/**
 * Schema de validación para creación de tipos de documento.
 *
 * Define reglas simples:
 * - name: obligatorio, máximo 100 caracteres
 * - acronym: obligatorio, máximo 10 caracteres (ej: "CC", "TI", "CE")
 *
 * @constant
 * @type {Array<Object>}
 */
const documentTypeCreateSchema = [
  { name: "name",    type: "text", required: true, maxLength: 100 },
  { name: "acronym", type: "text", required: true, maxLength: 10  },
];

/**
 * Hook personalizado para gestionar la creación de tipos de documento.
 *
 * Maneja el ciclo completo de creación:
 * - Estado del formulario
 * - Validación de campos
 * - Envío a la API
 * - Reseteo del formulario
 *
 * Características:
 * - Formulario simple de dos campos
 * - Ambos campos obligatorios
 * - Limpieza automática de espacios
 * - Validación antes de enviar
 * - Alertas de éxito/error
 * - Retorna ID del tipo de documento creado
 *
 * @hook
 *
 * @returns {Object} Objeto con estado y funciones del formulario
 * @returns {Object}   return.form             - Valores del formulario
 * @returns {string}   return.form.name        - Nombre del tipo de documento
 * @returns {string}   return.form.acronym     - Sigla del tipo de documento
 * @returns {Object}   return.errors           - Mensajes de error por campo
 * @returns {boolean}  return.loading          - Si está enviando datos
 * @returns {Function} return.onChange         - Handler para cambios en inputs
 * @returns {Function} return.validateAndSave  - Valida y crea el tipo de documento
 * @returns {Function} return.resetForm        - Resetea el formulario
 *
 * @example
 * function DocumentTypeCreatePage() {
 *   const { form, errors, loading, onChange, validateAndSave, resetForm } = useDocumentTypeCreate();
 *
 *   const handleSubmit = async (e) => {
 *     e.preventDefault();
 *     const result = await validateAndSave();
 *     if (result.ok) {
 *       navigate(`/document_types/${result.createdId}`);
 *     }
 *   };
 *
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <InputField
 *         label="Nombre del Tipo de Documento"
 *         name="name"
 *         value={form.name}
 *         onChange={onChange}
 *         error={errors.name}
 *         required
 *       />
 *       <InputField
 *         label="Sigla"
 *         name="acronym"
 *         value={form.acronym}
 *         onChange={onChange}
 *         error={errors.acronym}
 *         required
 *       />
 *       <button type="submit" disabled={loading}>Crear Tipo de Documento</button>
 *     </form>
 *   );
 * }
 */
export default function useDocumentTypeCreate() {
  // Estado inicial: formulario vacío
  const [form, setForm] = useState({
    name:    "",
    acronym: "",
  });

  // Errores de validación por campo
  const [errors, setErrors] = useState({});

  // Estado de carga mientras se envía al backend
  const [loading, setLoading] = useState(false);

  /**
   * Maneja cambios en los campos del formulario.
   *
   * - Actualiza el valor del campo modificado
   * - Limpia el error del campo cuando el usuario empieza a corregir
   *
   * @param {Event} e - Evento change del input
   */
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  /**
   * Valida el formulario y crea el tipo de documento en el servidor.
   *
   * Proceso:
   * 1. Validación con schema (name y acronym requeridos, longitudes)
   * 2. Si hay errores, los muestra y detiene
   * 3. Construye payload con trim()
   * 4. Envía POST a la API
   * 5. Muestra alerta de éxito/error
   * 6. Retorna objeto con resultado y ID creado
   *
   * @async
   * @returns {Promise<Object|boolean>} Objeto {ok: true, createdId: number} si éxito, false si falla
   *
   * @example
   * const result = await validateAndSave();
   * if (result && result.ok) {
   *   console.log("Tipo de documento creado con ID:", result.createdId);
   *   resetForm();
   * }
   */
  const validateAndSave = async () => {
    // Validación con schema antes de enviar
    const result = validarCamposReact(form, documentTypeCreateSchema);
    if (!result.ok) {
      setErrors(result.errors || {});
      return false;
    }

    try {
      setLoading(true);

      // Construye el payload limpiando espacios
      const payload = {
        name:    form.name?.trim(),
        acronym: form.acronym?.trim(),
      };

      // Envía POST a la API
      const res = await api.post("document_types", payload);

      if (!res.ok) {
        await error(res.message || "No se pudo crear el tipo de documento.");
        return false;
      }

      // Extrae el ID del tipo de documento creado para navegación posterior
      const createdId = res?.data?.id ?? null;

      await success(res.message || "Tipo de documento creado con éxito.");
      return { ok: true, createdId };
    } catch (e) {
      await error(e?.message || "Error de conexión. Intenta de nuevo.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resetea el formulario a su estado inicial.
   *
   * Limpia tanto valores como errores.
   * Útil después de crear un tipo de documento o al cancelar.
   */
  const resetForm = () => {
    setForm({ name: "", acronym: "" });
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
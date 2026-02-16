import { useState } from "react";
import { api } from "../services/apiClient";
import { validarCamposReact } from "../utils/validators";
import { success, error } from "../utils/alertas";

/**
 * Schema de validación para creación de áreas.
 * 
 * Define reglas simples:
 * - name: obligatorio, máximo 80 caracteres
 * - description: opcional, entre 3 y 255 caracteres si se proporciona
 * 
 * @constant
 * @type {Array<Object>}
 */
const areaCreateSchema = [
  { name: "name", type: "text", required: true, maxLength: 80 },
  { name: "description", type: "text", required: false, minLength: 3, maxLength: 255 },
];

/**
 * Hook personalizado para gestionar la creación de áreas.
 * 
 * Maneja el ciclo completo de creación de un área:
 * - Estado del formulario
 * - Validación de campos
 * - Envío a la API
 * - Reseteo del formulario
 * 
 * Las áreas son entidades organizacionales (ej: "Área de Desarrollo",
 * "Área de Diseño") que agrupan programas de formación.
 * 
 * Características:
 * - Formulario simple de dos campos
 * - Descripción opcional
 * - Limpieza automática de espacios
 * - Validación antes de enviar
 * - Alertas de éxito/error
 * - Retorna ID del área creada
 * 
 * @hook
 * 
 * @returns {Object} Objeto con estado y funciones del formulario
 * @returns {Object} return.form - Valores del formulario
 * @returns {string} return.form.name - Nombre del área
 * @returns {string} return.form.description - Descripción del área (opcional)
 * @returns {Object} return.errors - Mensajes de error por campo
 * @returns {boolean} return.loading - Si está enviando datos
 * @returns {Function} return.onChange - Handler para cambios en inputs
 * @returns {Function} return.validateAndSave - Valida y crea el área
 * @returns {Function} return.resetForm - Resetea el formulario
 * 
 * @example
 * function CreateAreaPage() {
 *   const { form, errors, loading, onChange, validateAndSave, resetForm } = useAreaCreate();
 * 
 *   const handleSubmit = async (e) => {
 *     e.preventDefault();
 *     const result = await validateAndSave();
 *     if (result.ok) {
 *       navigate(`/areas/${result.createdId}`);
 *     }
 *   };
 * 
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <InputField
 *         label="Nombre del Área"
 *         name="name"
 *         value={form.name}
 *         onChange={onChange}
 *         error={errors.name}
 *         required
 *       />
 *       <InputField
 *         label="Descripción"
 *         name="description"
 *         value={form.description}
 *         onChange={onChange}
 *         error={errors.description}
 *         textarea
 *       />
 *       <button type="submit" disabled={loading}>Crear Área</button>
 *     </form>
 *   );
 * }
 */
export default function useAreaCreate() {
  // Estado inicial: formulario vacío
  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  // Errores de validación
  const [errors, setErrors] = useState({});
  
  // Estado de carga
  const [loading, setLoading] = useState(false);

  /**
   * Maneja cambios en los campos del formulario.
   * 
   * - Actualiza el valor del campo
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
   * Valida el formulario y crea el área en el servidor.
   * 
   * Proceso:
   * 1. Validación con schema (name requerido, longitudes)
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
   *   console.log("Área creada con ID:", result.createdId);
   *   resetForm();
   * }
   */
  const validateAndSave = async () => {
    // Validación con schema
    const result = validarCamposReact(form, areaCreateSchema);
    if (!result.ok) {
      setErrors(result.errors || {});
      return false;
    }

    try {
      setLoading(true);

      // Construye el payload
      // description puede ser null si está vacío
      const payload = {
        name: form.name?.trim(),
        description: form.description?.trim() || null,
      };

      // Envía POST a la API
      const res = await api.post("areas", payload);

      if (!res.ok) {
        await error(res.message || "No se pudo crear el área.");
        return false;
      }

      // Extrae el ID del área creada
      const createdId = res?.data?.id ?? null;

      await success(res.message || "Área creada con éxito.");
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
   * Útil después de crear un área o al cancelar.
   */
  const resetForm = () => {
    setForm({ name: "", description: "" });
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

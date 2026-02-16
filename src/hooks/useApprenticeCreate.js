import { useState } from "react";
import { api } from "../services/apiClient";
import { validarCamposReact } from "../utils/validators";
import { success, error } from "../utils/alertas";

/**
 * Schema de validación para creación de aprendices.
 * 
 * Define las reglas de validación para cada campo del formulario:
 * - Tipos de datos (text, email, select)
 * - Campos obligatorios
 * - Longitudes mínimas y máximas
 * - Patrones regex para formatos específicos
 * 
 * @constant
 * @type {Array<Object>}
 */
const apprenticeCreateSchema = [
  { name: "first_name", type: "text", required: true, maxLength: 80 },
  { name: "last_name", type: "text", required: true, maxLength: 80 },
  { name: "email", type: "email", required: true, maxLength: 120 },
  { name: "telephone_number", type: "text", required: true, minLength: 7, maxLength: 20 },

  // Fecha de nacimiento debe estar en formato ISO (YYYY-MM-DD)
  { name: "birth_date", type: "text", required: true, pattern: /^\d{4}-\d{2}-\d{2}$/, patternMessage: "Fecha inválida (YYYY-MM-DD)" },

  { name: "document_type_id", type: "select", required: true },
  { name: "training_program_id", type: "select", required: true },
  { name: "ficha_id", type: "select", required: true },
  { name: "document_number", type: "text", required: true, minLength: 6, maxLength: 20 },
];

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD.
 * 
 * Utiliza toISOString() que retorna formato ISO 8601 completo:
 * "2026-02-16T19:37:00.000Z"
 * 
 * slice(0, 10) extrae solo los primeros 10 caracteres (la fecha).
 * 
 * @function
 * @returns {string} Fecha actual en formato YYYY-MM-DD
 * 
 * @example
 * todayYmd() // "2026-02-16"
 */
function todayYmd() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Hook personalizado para gestionar la creación de aprendices.
 * 
 * Maneja todo el ciclo de vida del formulario de creación:
 * - Estado del formulario con valores por defecto
 * - Validación de campos en tiempo real
 * - Validación adicional de fecha de nacimiento
 * - Envío de datos a la API
 * - Reseteo del formulario
 * 
 * Características:
 * - Limpieza automática de espacios en blanco (trim)
 * - Conversión de IDs a números
 * - Validación extra: fecha de nacimiento debe ser anterior a hoy
 * - Limpieza de errores al cambiar valores
 * - Reseteo automático del campo ficha al cambiar programa
 * - Manejo de selects múltiples
 * 
 * @hook
 * 
 * @returns {Object} Objeto con estado y funciones del formulario
 * @returns {Object} return.form - Objeto con valores del formulario
 * @returns {string} return.form.first_name - Primer nombre
 * @returns {string} return.form.last_name - Apellido
 * @returns {string} return.form.email - Correo electrónico
 * @returns {string} return.form.telephone_number - Número telefónico
 * @returns {string} return.form.birth_date - Fecha de nacimiento (YYYY-MM-DD)
 * @returns {string} return.form.document_type_id - ID del tipo de documento
 * @returns {string} return.form.document_number - Número de documento
 * @returns {string} return.form.training_program_id - ID del programa de formación
 * @returns {string} return.form.ficha_id - ID de la ficha
 * @returns {Object} return.errors - Objeto con mensajes de error por campo
 * @returns {boolean} return.loading - Si está enviando datos a la API
 * @returns {Function} return.onChange - Handler para cambios en inputs
 * @returns {Function} return.validateAndSave - Función para validar y crear aprendiz
 * @returns {Function} return.resetForm - Función para resetear el formulario
 * 
 * @example
 * function CreateApprenticePage() {
 *   const { form, errors, loading, onChange, validateAndSave, resetForm } = useApprenticeCreate();
 * 
 *   const handleSubmit = async (e) => {
 *     e.preventDefault();
 *     const result = await validateAndSave();
 *     if (result.ok) {
 *       navigate(`/apprentices/${result.createdId}`);
 *     }
 *   };
 * 
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <InputField
 *         label="Nombre"
 *         name="first_name"
 *         value={form.first_name}
 *         onChange={onChange}
 *         error={errors.first_name}
 *       />
 *       <button type="submit" disabled={loading}>Crear</button>
 *     </form>
 *   );
 * }
 */
export default function useApprenticeCreate() {
  // Estado inicial del formulario con todos los campos vacíos
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    telephone_number: "",
    birth_date: "",
    document_type_id: "",
    document_number: "",
    training_program_id: "",
    ficha_id: "",
  });

  // Errores de validación por campo
  const [errors, setErrors] = useState({});
  
  // Estado de carga durante el guardado
  const [loading, setLoading] = useState(false);

  /**
   * Maneja cambios en los campos del formulario.
   * 
   * Características especiales:
   * - Soporta selects múltiples (extrae array de valores)
   * - Al cambiar training_program_id, resetea ficha_id
   *   (las fichas dependen del programa seleccionado)
   * - Limpia errores del campo modificado
   * 
   * @param {Event} e - Evento change del input
   */
  const onChange = (e) => {
    const { name, value, multiple, selectedOptions } = e.target;

    // Para selects múltiples, extrae array de valores seleccionados
    const nextValue = multiple
      ? Array.from(selectedOptions).map((opt) => opt.value)
      : value;

    setForm((prev) => {
      // Caso especial: al cambiar programa, resetea la ficha
      // (las fichas pertenecen a un programa específico)
      if (name === "training_program_id") {
        return { ...prev, training_program_id: nextValue, ficha_id: "" };
      }
      return { ...prev, [name]: nextValue };
    });

    // Limpia el error del campo cuando el usuario empieza a corregirlo
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  /**
   * Valida el formulario y crea el aprendiz en el servidor.
   * 
   * Proceso:
   * 1. Validación con schema (campos requeridos, formatos, longitudes)
   * 2. Validación extra: fecha de nacimiento < hoy
   * 3. Si hay errores, los muestra y retorna false
   * 4. Si todo está bien, envía a la API
   * 5. Muestra alerta de éxito/error
   * 6. Retorna objeto con resultado y ID creado
   * 
   * @async
   * @returns {Promise<Object|boolean>} Objeto {ok: true, createdId: number} si éxito, false si falla
   * 
   * @example
   * const result = await validateAndSave();
   * if (result && result.ok) {
   *   console.log("Aprendiz creado con ID:", result.createdId);
   * }
   */
  const validateAndSave = async () => {
    // Paso 1: Validación con schema
    const result = validarCamposReact(form, apprenticeCreateSchema);

    // Paso 2: Validaciones extra
    const extraErrors = {};
    const today = todayYmd();
    
    // Valida que la fecha de nacimiento sea anterior a hoy
    if (form.birth_date && form.birth_date >= today) {
      extraErrors.birth_date = "La fecha de nacimiento debe ser anterior a hoy.";
    }

    // Combina errores del schema con errores extra
    const mergedErrors = { ...(result?.errors || {}), ...extraErrors };
    setErrors(mergedErrors);

    // Si hay errores, detiene el proceso
    if (!result.ok || Object.keys(extraErrors).length > 0) return false;

    try {
      setLoading(true);

      // Construye el payload limpiando espacios y convirtiendo IDs a números
      const payload = {
        first_name: form.first_name?.trim(),
        last_name: form.last_name?.trim(),
        email: form.email?.trim(),
        telephone_number: form.telephone_number?.trim(),
        birth_date: form.birth_date,
        // Convierte string a número, o null si está vacío
        document_type_id: form.document_type_id ? Number(form.document_type_id) : null,
        document_number: form.document_number?.trim(),
        training_program_id: form.training_program_id ? Number(form.training_program_id) : null,
        ficha_id: form.ficha_id ? Number(form.ficha_id) : null,
      };

      // Envía a la API
      const res = await api.post("apprentices", payload);

      if (!res.ok) {
        await error(res.message || "No se pudo crear el aprendiz.");
        return false;
      }

      // Extrae el ID del aprendiz creado (maneja diferentes estructuras de respuesta)
      const createdId = res?.data?.id ?? res?.data?.data?.id ?? null;

      await success(res.message || "Aprendiz creado con éxito.");
      return { ok: true, createdId };
    } catch (e) {
      console.error(e);
      await error(e?.message || "Error de conexión. Intenta de nuevo.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resetea el formulario a su estado inicial.
   * 
   * Útil después de crear un aprendiz o al cancelar la creación.
   * Limpia tanto los valores como los errores.
   */
  const resetForm = () => {
    setForm({
      first_name: "",
      last_name: "",
      email: "",
      telephone_number: "",
      birth_date: "",
      document_type_id: "",
      document_number: "",
      training_program_id: "",
      ficha_id: "",
    });
    setErrors({});
  };

  return { form, errors, loading, onChange, validateAndSave, resetForm };
}

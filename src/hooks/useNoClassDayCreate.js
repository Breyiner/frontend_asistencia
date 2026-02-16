// Importa useState de React
import { useState } from "react";

// Importa cliente de API
import { api } from "../services/apiClient";

// Importa función de validación personalizada
import { validarCamposReact } from "../utils/validators";

// Importa utilidades de alertas
import { success, error } from "../utils/alertas";

/**
 * Esquema de validación para crear día sin clase.
 * 
 * Define las reglas de validación para cada campo:
 * - ficha_id: select obligatorio (ID de la ficha)
 * - reason_id: select obligatorio (motivo del día sin clase)
 * - date: fecha obligatoria
 * - observations: texto opcional, máximo 1000 caracteres
 * 
 * @constant
 * @type {Array<Object>}
 */
const baseSchema = [
  { name: "ficha_id", type: "select", required: true },
  { name: "reason_id", type: "select", required: true },
  { name: "date", type: "date", required: true },
  { name: "observations", type: "text", required: false, maxLength: 1000 },
];

/**
 * Hook personalizado para crear días sin clase.
 * 
 * Gestiona todo el proceso de creación de un día sin clase:
 * - Estado del formulario
 * - Validación de campos
 * - Envío de datos al backend
 * - Manejo de errores
 * - Retroalimentación al usuario
 * 
 * Casos de uso:
 * - Festivos
 * - Suspensión de clases
 * - Eventos especiales
 * - Días de formación docente
 * 
 * @hook
 * 
 * @returns {Object} Objeto con estados y funciones del formulario
 * @returns {Object} returns.form - Estado actual del formulario
 * @returns {string} returns.form.ficha_id - ID de la ficha seleccionada
 * @returns {string} returns.form.reason_id - ID del motivo seleccionado
 * @returns {string} returns.form.date - Fecha del día sin clase
 * @returns {string} returns.form.observations - Observaciones opcionales
 * @returns {Object} returns.errors - Objeto con mensajes de error por campo
 * @returns {boolean} returns.loading - Estado de carga durante el guardado
 * @returns {Function} returns.onChange - Handler para cambios en inputs
 * @returns {Function} returns.validateAndSave - Función para validar y guardar
 * 
 * @example
 * function NoClassDayCreatePage() {
 *   const { form, errors, loading, onChange, validateAndSave } = useNoClassDayCreate();
 *   
 *   const handleSubmit = async (e) => {
 *     e.preventDefault();
 *     const result = await validateAndSave();
 *     if (result.ok) {
 *       navigate(`/no_class_days/${result.data.id}`);
 *     }
 *   };
 *   
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <InputField
 *         name="ficha_id"
 *         value={form.ficha_id}
 *         onChange={onChange}
 *         error={errors.ficha_id}
 *         options={fichas}
 *       />
 *       <button disabled={loading}>Guardar</button>
 *     </form>
 *   );
 * }
 */
export default function useNoClassDayCreate() {
  
  /**
   * Estado del formulario con valores iniciales vacíos.
   * 
   * Todos los campos comienzan como strings vacíos para
   * evitar warnings de "uncontrolled to controlled" en React.
   */
  const [form, setForm] = useState({
    ficha_id: "",       // ID de la ficha
    reason_id: "",      // ID del motivo
    date: "",           // Fecha del día sin clase
    observations: "",   // Observaciones opcionales
  });

  // Estado para almacenar errores de validación por campo
  const [errors, setErrors] = useState({});
  
  // Estado de carga durante el proceso de guardado
  const [loading, setLoading] = useState(false);

  /**
   * Maneja cambios en los campos del formulario.
   * 
   * Actualiza el estado del formulario y limpia el error del campo
   * si el usuario está corrigiendo.
   * 
   * @param {Event} e - Evento change del input
   */
  const onChange = (e) => {
    const { name, value } = e.target;
    
    // Actualiza el valor del campo en el estado
    setForm((prev) => ({ ...prev, [name]: value }));
    
    // Si había error en este campo, lo limpia
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  /**
   * Valida el formulario y guarda el día sin clase.
   * 
   * Proceso:
   * 1. Valida campos según baseSchema
   * 2. Si hay errores, los muestra y retorna false
   * 3. Construye payload con datos transformados
   * 4. Envía POST al backend
   * 5. Muestra alerta de éxito o error
   * 6. Retorna objeto con resultado
   * 
   * @async
   * @returns {Promise<Object|boolean>} Objeto {ok: true, data} o false si falla
   */
  const validateAndSave = async () => {
    // Valida el formulario contra el esquema definido
    const result = validarCamposReact(form, baseSchema);
    
    // Si la validación falla
    if (!result.ok) {
      // Establece los errores en el estado
      setErrors(result.errors || {});
      
      // Retorna false indicando fallo de validación
      return false;
    }

    try {
      // Activa estado de carga
      setLoading(true);

      /**
       * Construye el payload para el backend.
       * 
       * Transforma los valores del formulario:
       * - IDs: convierte strings a números
       * - observations: trim y null si está vacío
       */
      const payload = {
        ficha_id: Number(form.ficha_id),
        reason_id: Number(form.reason_id),
        date: form.date,
        // Trim y convierte string vacío a null
        observations: form.observations?.trim() || null,
      };

      // Envía POST al endpoint de días sin clase
      const res = await api.post("no_class_days", payload);
      
      // Si la respuesta indica fallo
      if (!res.ok) {
        // Muestra alerta de error
        await error(res.message || "No se pudo crear el día sin clase.");
        
        // Retorna false indicando fallo
        return false;
      }

      // Éxito: muestra alerta de éxito
      await success(res.message || "Día sin clase creado con éxito.");
      
      // Retorna objeto con flag ok y datos creados
      // Los datos incluyen el ID del registro creado
      return { ok: true, data: res.data };
      
    } catch (e) {
      // Captura errores de red o excepciones
      await error(e?.message || "Error de conexión.");
      
      // Retorna false indicando fallo crítico
      return false;
      
    } finally {
      // Siempre desactiva estado de carga
      setLoading(false);
    }
  };

  // Retorna estados y funciones del hook
  return { form, errors, loading, onChange, validateAndSave };
}
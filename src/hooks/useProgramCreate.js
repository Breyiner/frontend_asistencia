// Importa useState de React
import { useState } from "react";

// Importa cliente de API
import { api } from "../services/apiClient";

// Importa función de validación
import { validarCamposReact } from "../utils/validators";

// Importa utilidades de alertas
import { success, error } from "../utils/alertas";

/**
 * Esquema de validación para crear programa de formación.
 * 
 * Define reglas de validación:
 * - name: texto obligatorio, máximo 80 caracteres
 * - duration: texto obligatorio, 1-2 caracteres (meses/trimestres)
 * - qualification_level_id: select obligatorio (Técnico, Tecnólogo, etc.)
 * - area_id: select obligatorio (área de conocimiento)
 * - coordinator_id: select obligatorio (ID del coordinador)
 * - description: texto opcional, 10-100 caracteres
 * 
 * @constant
 * @type {Array<Object>}
 */
const programCreateSchema = [
    { name: "name", type: "text", required: true, maxLength: 80 },
    { name: "duration", type: "text", required: true, minLength: 1, maxLength: 2 },
    { name: "qualification_level_id", type: "select", required: true },
    { name: "area_id", type: "select", required: true },
    { name: "coordinator_id", type: "select", required: true },
    { name: "description", type: "text", minLength: 10, maxLength: 100 },
];

/**
 * Hook personalizado para crear programas de formación.
 * 
 * Gestiona el proceso completo de creación de un programa:
 * - Estado del formulario con todos los campos
 * - Validación de campos
 * - Transformación de datos para el backend
 * - Envío y manejo de respuesta
 * - Reseteo del formulario
 * - Retroalimentación al usuario
 * 
 * Casos de uso:
 * - Crear programa Técnico, Tecnólogo o Especialización
 * - Asignar coordinador y área
 * - Definir duración del programa
 * 
 * @hook
 * 
 * @returns {Object} Objeto con estados y funciones del formulario
 * @returns {Object} returns.form - Estado actual del formulario
 * @returns {Object} returns.errors - Errores de validación por campo
 * @returns {boolean} returns.loading - Estado de carga durante guardado
 * @returns {Function} returns.onChange - Handler para cambios en inputs
 * @returns {Function} returns.validateAndSave - Validar y guardar programa
 * @returns {Function} returns.resetForm - Resetear formulario a valores iniciales
 * 
 * @example
 * function ProgramCreatePage() {
 *   const { form, errors, loading, onChange, validateAndSave, resetForm } = useProgramCreate();
 *   
 *   const handleSubmit = async (e) => {
 *     e.preventDefault();
 *     const result = await validateAndSave();
 *     if (result.ok) {
 *       navigate(`/training_programs/${result.createdId}`);
 *     }
 *   };
 *   
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <InputField name="name" value={form.name} onChange={onChange} error={errors.name} />
 *       <button disabled={loading}>Crear Programa</button>
 *     </form>
 *   );
 * }
 */
export default function useProgramCreate() {
    
    /**
     * Estado del formulario con valores iniciales vacíos.
     */
    const [form, setForm] = useState({
        name: "",                      // Nombre del programa
        duration: "",                  // Duración en meses/trimestres
        qualification_level_id: "",    // Nivel de cualificación
        area_id: "",                   // Área de conocimiento
        coordinator_id: "",            // Coordinador del programa
        description: "",               // Descripción del programa
    });

    // Estado de errores de validación
    const [errors, setErrors] = useState({});
    
    // Estado de carga durante guardado
    const [loading, setLoading] = useState(false);

    /**
     * Maneja cambios en los campos del formulario.
     * 
     * @param {Event} e - Evento change del input
     */
    const onChange = (e) => {
        const { name, value } = e.target;
        
        // Actualiza el campo en el estado
        setForm((prev) => ({ ...prev, [name]: value }));
        
        // Limpia error del campo si existe
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    /**
     * Valida y guarda el programa de formación.
     * 
     * @async
     * @returns {Promise<Object|boolean>} Objeto {ok: true, createdId} o false
     */
    const validateAndSave = async () => {
        // Valida el formulario
        const result = validarCamposReact(form, programCreateSchema);
        
        if (!result.ok) {
            setErrors(result.errors || {});
            return false;
        }

        try {
            setLoading(true);

            /**
             * Construye payload transformando valores:
             * - Strings: trim para remover espacios
             * - IDs: convierte a Number
             * - Campos opcionales: null si están vacíos
             */
            const payload = {
                name: form.name?.trim(),
                duration: form.duration ? Number(form.duration) : null,
                qualification_level_id: form.qualification_level_id ? Number(form.qualification_level_id) : null,
                area_id: form.area_id ? Number(form.area_id) : null,
                coordinator_id: form.coordinator_id ? Number(form.coordinator_id) : null,
                description: form.description?.trim(),
            };

            // Envía POST al endpoint
            const res = await api.post("training_programs", payload);

            if (!res.ok) {
                await error(res.message || "No se pudo crear el programa.");
                return false;
            }

            /**
             * Extrae el ID del programa creado.
             * 
             * Intenta múltiples rutas porque diferentes backends
             * pueden estructurar la respuesta diferente:
             * - res.data.id
             * - res.data.data.id
             */
            const createdId = res?.data?.id ?? res?.data?.data?.id ?? null;

            await success(res.message || "Programa creado con éxito.");
            
            // Retorna objeto con flag de éxito y ID creado
            return { ok: true, createdId };
            
        } catch (e) {
            
            await error(e?.message || "Error de conexión. Intenta de nuevo.");
            return false;
            
        } finally {
            setLoading(false);
        }
    };

    /**
     * Resetea el formulario a sus valores iniciales.
     * 
     * Útil después de crear un programa exitosamente
     * para permitir crear otro inmediatamente.
     */
    const resetForm = () => {
        // Resetea form a valores iniciales
        setForm({
            name: "",
            duration: "",
            qualification_level_id: "",
            area_id: "",
            coordinator_id: "",
            description: "",
        });
        
        // Limpia errores
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
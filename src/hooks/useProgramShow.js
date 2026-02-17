// Importa hooks de React para manejo de estado y efectos secundarios
import { useEffect, useState, useCallback } from "react";

// Importa cliente de API para comunicación con el backend
import { api } from "../services/apiClient";

// Importa función de validación personalizada de formularios
import { validarCamposReact } from "../utils/validators";

// Importa utilidades de alertas (SweetAlert2 o similar)
import { success, error, confirm } from "../utils/alertas";

// Importa hook de navegación de react-router-dom
import { useNavigate } from "react-router-dom";

/**
 * Esquema de validación para actualizar programa de formación.
 * 
 * Define las reglas de validación para cada campo del formulario:
 * - name: texto obligatorio, máximo 80 caracteres (nombre del programa)
 * - duration: texto obligatorio, 1-2 caracteres (duración en meses/trimestres)
 * - qualification_level_id: select obligatorio (Técnico, Tecnólogo, Especialización)
 * - area_id: select obligatorio (área de conocimiento: TI, Salud, etc.)
 * - coordinator_id: select obligatorio (ID del instructor coordinador)
 * - description: texto opcional, mínimo 10 caracteres, máximo 100
 * 
 * Este esquema se usa con validarCamposReact para validación del lado del cliente.
 * 
 * @constant
 * @type {Array<Object>}
 */
const programUpdateSchema = [
    { name: "name", type: "text", required: true, maxLength: 80 },
    { name: "duration", type: "text", required: true, minLength: 1, maxLength: 2 },
    { name: "qualification_level_id", type: "select", required: true },
    { name: "area_id", type: "select", required: true },
    { name: "coordinator_id", type: "select", required: true },
    { name: "description", type: "text", minLength: 10, maxLength: 100 },
];

/**
 * Mapea un objeto de programa del backend al formato del formulario.
 * 
 * Transforma los datos del backend (con IDs numéricos y posibles valores null)
 * a strings seguros para uso en inputs y selects de formulario.
 * 
 * Esto previene warnings de React sobre componentes controlados
 * y asegura que todos los campos tengan valores válidos.
 * 
 * @function
 * @param {Object|null} program - Objeto de programa del backend
 * @param {string} [program.name] - Nombre del programa
 * @param {number} [program.duration] - Duración en meses
 * @param {number} [program.qualification_level_id] - ID del nivel de cualificación
 * @param {number} [program.area_id] - ID del área
 * @param {number} [program.coordinator_id] - ID del coordinador
 * @param {string} [program.description] - Descripción del programa
 * @returns {Object} Objeto con valores del formulario (todos strings o string vacío)
 * 
 * @example
 * const program = {
 *   name: "ADSI",
 *   duration: 24,
 *   qualification_level_id: 2,
 *   area_id: 1,
 *   coordinator_id: 5,
 *   description: "Análisis y Desarrollo de Software"
 * };
 * 
 * mapProgramToForm(program);
 * // Retorna:
 * // {
 * //   name: "ADSI",
 * //   duration: "24",
 * //   qualification_level_id: "2",
 * //   area_id: "1",
 * //   coordinator_id: "5",
 * //   description: "Análisis y Desarrollo de Software"
 * // }
 */
function mapProgramToForm(program) {
    return {
        // Nombre del programa: usa valor del backend o string vacío
        name: program?.name || "",
        
        // Duración: usa valor del backend o string vacío
        duration: program?.duration || "",
        
        // ID de nivel de cualificación: convierte a string o vacío
        // El operador ? verifica si existe antes de acceder
        qualification_level_id: program?.qualification_level_id ? String(program.qualification_level_id) : "",
        
        // ID de área: convierte a string o vacío
        area_id: program?.area_id ? String(program.area_id) : "",
        
        // ID de coordinador: convierte a string o vacío
        coordinator_id: program?.coordinator_id ? String(program.coordinator_id) : "",
        
        // Descripción: usa valor del backend o string vacío
        description: program?.description || "",
    };
}

/**
 * Hook personalizado para mostrar y editar un programa de formación.
 * 
 * Proporciona toda la funcionalidad necesaria para una página de detalle/edición:
 * - Carga de datos del backend
 * - Alternancia entre modo visualización y edición
 * - Validación de campos del formulario
 * - Guardado de cambios con manejo de errores
 * - Eliminación del programa con confirmación
 * - Recarga de datos después de operaciones
 * 
 * Patrón de uso típico:
 * 1. Componente monta → carga datos del backend
 * 2. Usuario ve datos en modo visualización
 * 3. Usuario hace click en "Editar" → activa modo edición
 * 4. Usuario modifica campos → actualiza formulario
 * 5. Usuario guarda → valida, envía al backend, recarga datos
 * 6. O usuario cancela → restaura datos originales
 * 
 * @hook
 * 
 * @param {string|number} id - ID del programa de formación a mostrar/editar
 * 
 * @returns {Object} Objeto con estados y funciones para gestionar el programa
 * @returns {Object|null} returns.program - Datos completos del programa del backend
 * @returns {boolean} returns.loading - true durante carga inicial de datos
 * @returns {boolean} returns.isEditing - true si está en modo edición
 * @returns {Object} returns.form - Estado actual del formulario de edición
 * @returns {Object} returns.errors - Objeto con mensajes de error por campo
 * @returns {boolean} returns.saving - true durante guardado o eliminación
 * @returns {Function} returns.startEdit - Función para activar modo edición
 * @returns {Function} returns.cancelEdit - Función para cancelar edición
 * @returns {Function} returns.onChange - Handler para cambios en campos del formulario
 * @returns {Function} returns.save - Función async para guardar cambios
 * @returns {Function} returns.deleteProgram - Función async para eliminar programa
 * @returns {Function} returns.refetch - Función para recargar datos del backend
 * 
 * @example
 * // En ProgramShowPage.jsx
 * function ProgramShowPage() {
 *   const { id } = useParams();
 *   const {
 *     program,
 *     loading,
 *     isEditing,
 *     form,
 *     errors,
 *     saving,
 *     startEdit,
 *     cancelEdit,
 *     onChange,
 *     save,
 *     deleteProgram
 *   } = useProgramShow(id);
 *   
 *   if (loading) return <div>Cargando programa...</div>;
 *   if (!program) return <div>Programa no encontrado</div>;
 *   
 *   return (
 *     <div>
 *       {isEditing ? (
 *         <form>
 *           <InputField
 *             label="Nombre"
 *             name="name"
 *             value={form.name}
 *             onChange={onChange}
 *             error={errors.name}
 *           />
 *           <Button onClick={save} disabled={saving}>
 *             {saving ? "Guardando..." : "Guardar"}
 *           </Button>
 *           <Button onClick={cancelEdit} disabled={saving}>
 *             Cancelar
 *           </Button>
 *         </form>
 *       ) : (
 *         <div>
 *           <InfoRow label="Nombre" value={program.name} />
 *           <InfoRow label="Duración" value={`${program.duration} meses`} />
 *           <Button onClick={startEdit}>Editar</Button>
 *           <Button onClick={deleteProgram}>Eliminar</Button>
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 */
export default function useProgramShow(id) {
    
    // Hook de navegación para redirección después de eliminar
    const navigate = useNavigate();
    
    // Estado para almacenar los datos completos del programa del backend
    // null mientras no se hayan cargado datos
    const [program, setProgram] = useState(null);
    
    // Estado de carga durante el fetch inicial
    // true mientras se están obteniendo datos del backend
    const [loading, setLoading] = useState(false);

    // Estado que indica si el componente está en modo edición
    // false por defecto (inicia en modo visualización)
    const [isEditing, setIsEditing] = useState(false);
    
    // Estado del formulario de edición
    // Inicializado con valores vacíos hasta que se carguen los datos
    const [form, setForm] = useState(mapProgramToForm(null));
    
    // Estado para almacenar errores de validación por campo
    // Estructura: { fieldName: "mensaje de error" }
    const [errors, setErrors] = useState({});
    
    // Estado de carga durante operaciones de guardado o eliminación
    // true mientras se está ejecutando save() o deleteProgram()
    const [saving, setSaving] = useState(false);

    /**
     * Función asíncrona para cargar el programa del backend.
     * 
     * Obtiene los datos del programa usando el ID proporcionado.
     * No está memoizada con useCallback porque no se pasa como dependencia
     * a otros hooks o componentes.
     * 
     * Proceso:
     * 1. Verifica que exista ID
     * 2. Activa estado de carga
     * 3. Hace GET al endpoint del programa
     * 4. Si es exitoso, guarda los datos
     * 5. Si falla, guarda null y desactiva modo edición
     * 6. Siempre desactiva estado de carga (finally)
     * 
     * @async
     * @function
     */
    const fetchProgram = async () => {
        // Si no hay ID, no hace nada
        // Previene llamadas innecesarias al backend
        if (!id) return;
        
        // Activa indicador de carga
        setLoading(true);
        
        try {
            // Hace GET al endpoint del programa específico
            const res = await api.get(`training_programs/${id}`);
            
            // Si la respuesta es exitosa, guarda los datos
            // Si no, guarda null para indicar que no hay datos
            setProgram(res.ok ? res.data : null);

            // Si la carga falló, desactiva modo edición
            // Esto previene intentar editar datos que no existen
            if (!res.ok) setIsEditing(false);
            
        } finally {
            // Siempre desactiva el estado de carga
            // Se ejecuta tanto si fue exitoso como si hubo error
            setLoading(false);
        }
    };

    /**
     * Efecto para cargar el programa al montar el componente.
     * 
     * Se ejecuta cuando:
     * - El componente se monta por primera vez
     * - El ID cambia (navegación entre programas)
     * 
     * El comentario eslint-disable se usa porque React Hook exhaustive-deps
     * sugeriría agregar fetchProgram como dependencia, pero no es necesario
     * porque fetchProgram no está memoizada y solo depende de id.
     */
    useEffect(() => {
        fetchProgram();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]); // Solo se re-ejecuta si id cambia

    /**
     * Efecto para sincronizar el formulario con los datos del programa.
     * 
     * Actualiza el formulario cuando:
     * - Se cargan nuevos datos del programa (program cambia)
     * - Se cambia entre modo edición y visualización (isEditing cambia)
     * 
     * Importante: Solo actualiza si NO está en modo edición.
     * Esto evita sobrescribir cambios del usuario mientras edita.
     */
    useEffect(() => {
        // Si no hay programa cargado, no hace nada
        if (!program) return;
        
        // Solo actualiza el formulario si NO está en modo edición
        // Cuando isEditing es false (modo visualización), sincroniza el formulario
        // Cuando isEditing es true (modo edición), NO sobrescribe los cambios del usuario
        if (!isEditing) setForm(mapProgramToForm(program));
    }, [program, isEditing]); // Re-ejecuta si cambia program o isEditing

    /**
     * Activa el modo de edición.
     * 
     * Memoizada con useCallback para:
     * - Mantener referencia estable (evita re-renders innecesarios)
     * - Permitir uso seguro como dependencia en otros hooks
     * 
     * Acciones:
     * 1. Activa bandera de modo edición
     * 2. Limpia errores previos
     * 3. Inicializa formulario con datos actuales del programa
     * 
     * @callback
     */
    const startEdit = useCallback(() => {
        // Activa modo edición
        setIsEditing(true);
        
        // Limpia cualquier error de validación previo
        setErrors({});
        
        // Inicializa el formulario con los datos actuales del programa
        // Esto asegura que el usuario vea los datos más recientes al empezar a editar
        setForm(mapProgramToForm(program));
    }, [program]); // Se recrea solo si program cambia

    /**
     * Cancela la edición y vuelve al modo visualización.
     * 
     * No está memoizada porque no necesita estabilidad de referencia.
     * 
     * Acciones:
     * 1. Desactiva modo edición
     * 2. Limpia errores
     * 3. Restaura formulario a datos originales (descarta cambios)
     */
    const cancelEdit = () => {
        // Desactiva modo edición
        setIsEditing(false);
        
        // Limpia errores de validación
        setErrors({});
        
        // Restaura el formulario a los datos originales del programa
        // Esto descarta cualquier cambio no guardado que haya hecho el usuario
        setForm(mapProgramToForm(program));
    };

    /**
     * Maneja cambios en los campos del formulario.
     * 
     * No está memoizada porque es una función simple que no necesita
     * estabilidad de referencia especial.
     * 
     * Proceso:
     * 1. Extrae name y value del evento
     * 2. Actualiza el campo correspondiente en el formulario
     * 3. Si el campo tenía error, lo limpia (mejora UX)
     * 
     * @param {Event} e - Evento change del input/select
     */
    const onChange = (e) => {
        // Extrae name y value del input que cambió
        const { name, value } = e.target;
        
        // Actualiza solo el campo que cambió, manteniendo los demás
        // Usa función updater para acceder al estado previo de forma segura
        setForm((prev) => ({ ...prev, [name]: value }));
        
        // Si este campo tenía un error de validación, lo limpia
        // Esto mejora la UX mostrando que el usuario está corrigiendo el error
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    /**
     * Valida y guarda los cambios del programa en el backend.
     * 
     * No está memoizada porque solo se llama desde eventos de usuario
     * (click en botón guardar).
     * 
     * Proceso completo:
     * 1. Valida campos del formulario contra el esquema
     * 2. Si hay errores, los muestra y retorna false
     * 3. Construye payload transformando valores (trim, conversión a números)
     * 4. Envía PATCH al backend
     * 5. Si es exitoso:
     *    - Muestra alerta de éxito
     *    - Desactiva modo edición
     *    - Recarga datos actualizados del backend
     * 6. Si falla: muestra alerta de error
     * 7. Siempre desactiva estado de guardado (finally)
     * 
     * @async
     * @function
     * @returns {Promise<boolean>} true si guardó exitosamente, false si falló
     */
    const save = async () => {
        // Valida todos los campos del formulario contra el esquema
        const result = validarCamposReact(form, programUpdateSchema);
        
        // Si la validación falló
        if (!result.ok) {
            // Establece los errores en el estado para mostrarlos en el UI
            setErrors(result.errors || {});
            
            // Retorna false indicando que no se guardó
            return false;
        }

        try {
            // Activa estado de guardado (deshabilita botones, muestra spinner, etc.)
            setSaving(true);

            /**
             * Construye el payload para el backend.
             * 
             * Transforma los valores del formulario:
             * - Strings: aplica trim() para remover espacios
             * - IDs: convierte strings a números
             * - Valores opcionales: null si están vacíos
             * 
             * Esto asegura que el backend reciba datos en el formato correcto.
             */
            const payload = {
                // Nombre: trim para remover espacios al inicio y final
                name: form.name?.trim(),
                
                // Duración: convierte string a número, null si está vacío
                duration: form.duration ? Number(form.duration) : null,
                
                // ID de nivel de cualificación: convierte a número, null si está vacío
                qualification_level_id: form.qualification_level_id ? Number(form.qualification_level_id) : null,
                
                // ID de área: convierte a número, null si está vacío
                area_id: form.area_id ? Number(form.area_id) : null,
                
                // ID de coordinador: convierte a número, null si está vacío
                coordinator_id: form.coordinator_id ? Number(form.coordinator_id) : null,
                
                // Descripción: trim para remover espacios
                description: form.description?.trim(),
            };

            // Envía PATCH (actualización parcial) al backend
            // PATCH permite actualizar solo los campos proporcionados
            const res = await api.patch(`training_programs/${id}`, payload);

            // Si el backend retornó error
            if (!res.ok) {
                // Muestra alerta de error al usuario
                await error(res.message || "No se pudo actualizar el programa.");
                
                // Retorna false indicando fallo
                return false;
            }

            // Éxito: muestra alerta de éxito al usuario
            await success(res.message || "Programa actualizado con éxito.");
            
            // Desactiva modo edición (vuelve a modo visualización)
            setIsEditing(false);
            
            // Recarga los datos del programa desde el backend
            // Esto asegura que se muestren los datos más actuales
            // (pueden incluir transformaciones del backend)
            await fetchProgram();
            
            // Retorna true indicando éxito
            return true;
            
        } catch (e) {
            // Captura errores de red o excepciones inesperadas
            await error(e?.message || "Error de conexión. Intenta de nuevo.");
            
            // Retorna false indicando fallo crítico
            return false;
            
        } finally {
            // Siempre desactiva estado de guardado
            // Se ejecuta tanto en caso de éxito como de error
            setSaving(false);
        }
    };

    /**
     * Elimina el programa después de confirmación del usuario.
     * 
     * No está memoizada porque solo se llama desde eventos de usuario.
     * 
     * Proceso:
     * 1. Muestra diálogo de confirmación (SweetAlert2)
     * 2. Si usuario cancela, retorna false
     * 3. Si usuario confirma, envía DELETE al backend
     * 4. Si es exitoso:
     *    - Muestra alerta de éxito
     *    - Redirige a la lista de programas
     * 5. Si falla: muestra alerta de error
     * 6. Siempre desactiva estado de guardado
     * 
     * @async
     * @function
     * @returns {Promise<boolean>} true si eliminó, false si canceló o falló
     */
    const deleteProgram = async () => {
        // Muestra diálogo de confirmación modal
        // confirm() retorna un objeto con isConfirmed: boolean
        const confirmed = await confirm("¿Eliminar este programa permanentemente?");
        
        // Si el usuario canceló la confirmación
        if (!confirmed.isConfirmed) return false;

        try {
            // Activa estado de guardado (en este caso, eliminando)
            setSaving(true);
            
            // Envía DELETE al endpoint del programa específico
            const res = await api.delete(`training_programs/${id}`);

            // Si el backend retornó error
            if (!res.ok) {
                // Muestra alerta de error
                await error(res.message || "No se pudo eliminar");
                
                // Retorna false indicando fallo
                return false;
            }

            // Éxito: muestra alerta de éxito
            await success("Programa eliminado!");
            
            // Redirige a la lista de programas
            // Ya no tiene sentido quedarse en la página de un programa eliminado
            navigate("/training_programs");
            
            // Retorna true indicando éxito
            return true;
            
        } catch (e) {
            // Captura errores de red o excepciones
            await error(e?.message || "Error al eliminar");
            
            // Retorna false indicando fallo
            return false;
            
        } finally {
            // Siempre desactiva estado de guardado
            setSaving(false);
        }
    };

    /**
     * Retorna objeto con todos los estados y funciones del hook.
     * 
     * Este objeto es lo que consumirán los componentes que usen el hook.
     * Proporciona una interfaz completa para gestionar un programa.
     */
    return {
        program,              // Datos del programa del backend
        loading,              // Estado de carga inicial
        isEditing,            // Bandera de modo edición activo
        form,                 // Estado del formulario de edición
        errors,               // Objeto de errores de validación
        saving,               // Estado de guardado/eliminación en progreso
        startEdit,            // Función para activar modo edición
        cancelEdit,           // Función para cancelar edición
        onChange,             // Handler para cambios en campos
        save,                 // Función para guardar cambios
        deleteProgram,        // Función para eliminar programa
        refetch: fetchProgram,// Alias de fetchProgram para recargar datos
    };
}
import { useCallback, useMemo, useState } from "react";
import { api } from "../services/apiClient";
import { validarCamposReact } from "../utils/validators";
import { error, success } from "../utils/alertas";

/**
 * Normaliza valores de tiempo al formato HH:MM.
 * 
 * Algunos navegadores o APIs pueden retornar tiempo en formato
 * "HH:MM:SS" o "HH:MM:SS.sss", pero los inputs tipo "time"
 * esperan formato "HH:MM".
 * 
 * slice(0, 5) extrae solo los primeros 5 caracteres (HH:MM).
 * 
 * @function
 * @param {string} t - Valor de tiempo a normalizar
 * @returns {string} Tiempo en formato HH:MM o string vacío
 * 
 * @example
 * normalizeTime("14:30:00") // "14:30"
 * normalizeTime("08:15") // "08:15"
 * normalizeTime(null) // ""
 */
function normalizeTime(t) {
  if (!t) return "";
  return String(t).slice(0, 5);
}

/**
 * Reglas de validación por código de estado de asistencia.
 * 
 * Define qué campos son obligatorios según el tipo de asistencia:
 * 
 * - **present** (Asistencia): no requiere descripción ni hora de entrada
 * - **absent** (Inasistencia): no requiere descripción ni hora de entrada
 * - **excused_absence** (Justificada): REQUIERE descripción, no requiere hora
 * - **early_exit** (Salida anticipada): REQUIERE descripción, no requiere hora
 * - **late** (Tardanza): no requiere descripción, REQUIERE hora de entrada
 * - **unregistered** (Sin registrar): no requiere nada
 * 
 * Estas reglas se usan para validación dinámica del formulario.
 * 
 * @constant
 * @type {Object}
 */
const RULES_BY_CODE = {
  present: { requiresDescription: false, requiresEntryHour: false },
  absent: { requiresDescription: false, requiresEntryHour: false },
  excused_absence: { requiresDescription: true, requiresEntryHour: false },
  early_exit: { requiresDescription: true, requiresEntryHour: false },
  late: { requiresDescription: false, requiresEntryHour: true },
  unregistered: { requiresDescription: false, requiresEntryHour: false },
};

/**
 * Hook personalizado para gestionar el modal de edición de asistencias.
 * 
 * Maneja todo el flujo de edición de una marca de asistencia individual:
 * - Apertura/cierre del modal
 * - Validación dinámica según tipo de asistencia
 * - Actualización optimista del estado local
 * - Sincronización con el servidor
 * - Actualización del resumen de asistencias
 * 
 * Características avanzadas:
 * - **Validación dinámica**: los campos requeridos cambian según el estado seleccionado
 * - **Actualización optimista**: actualiza la UI inmediatamente antes de confirmar con el servidor
 * - **Rollback automático**: si falla, recarga los datos para revertir cambios
 * - **Cálculo automático**: el servidor recalcula absent_hours al guardar
 * - **Bloqueo durante guardado**: previene cierre accidental mientras guarda
 * - **Selección rápida de estados**: función auxiliar pickStatusId para botones
 * 
 * @hook
 * 
 * @param {Object} props - Configuración del hook
 * @param {Array<Object>} props.statuses - Catálogo de estados de asistencia disponibles
 * @param {Function} [props.setAttendances] - Setter para actualizar lista de asistencias
 * @param {Function} [props.setSummary] - Setter para actualizar resumen
 * @param {Function} [props.refetchAttendances] - Función para recargar asistencias desde API
 * 
 * @returns {Object} Objeto con estado y funciones del modal
 * @returns {boolean} return.open - Si el modal está abierto
 * @returns {Object|null} return.attendance - Registro de asistencia siendo editado
 * @returns {Object} return.form - Valores del formulario
 * @returns {string} return.form.attendance_status_id - ID del estado seleccionado
 * @returns {string} return.form.entry_hour - Hora de entrada (HH:MM)
 * @returns {string} return.form.observations - Observaciones/descripción
 * @returns {string} return.form.absent_hours - Horas ausentes (solo lectura)
 * @returns {Object} return.errors - Errores de validación por campo
 * @returns {boolean} return.saving - Si está guardando cambios
 * @returns {Object} return.rules - Reglas de validación actuales
 * @returns {boolean} return.rules.requiresDescription - Si descripción es obligatoria
 * @returns {boolean} return.rules.requiresEntryHour - Si hora de entrada es obligatoria
 * @returns {Object|null} return.selectedStatus - Objeto completo del estado seleccionado
 * @returns {Function} return.openModal - Abre el modal con una asistencia
 * @returns {Function} return.closeModal - Cierra el modal
 * @returns {Function} return.onChange - Handler para cambios en inputs
 * @returns {Function} return.pickStatusId - Función auxiliar para seleccionar estado por ID
 * @returns {Function} return.save - Guarda los cambios en el servidor
 * 
 * @example
 * function AttendancesList() {
 *   const [attendances, setAttendances] = useState([]);
 *   const [summary, setSummary] = useState(null);
 *   const statusesCatalog = useCatalog("attendance_statuses");
 * 
 *   const {
 *     open,
 *     attendance,
 *     form,
 *     errors,
 *     saving,
 *     rules,
 *     selectedStatus,
 *     openModal,
 *     closeModal,
 *     onChange,
 *     pickStatusId,
 *     save
 *   } = useAttendanceEditModal({
 *     statuses: statusesCatalog.options,
 *     setAttendances,
 *     setSummary,
 *     refetchAttendances: fetchAttendances
 *   });
 * 
 *   return (
 *     <>
 *       {attendances.map(att => (
 *         <div key={att.id} onClick={() => openModal(att)}>
 *           {att.apprentice.name}: {att.attendance_status.name}
 *         </div>
 *       ))}
 * 
 *       <AttendanceEditModal
 *         open={open}
 *         onClose={closeModal}
 *         form={form}
 *         errors={errors}
 *         onChange={onChange}
 *         onSave={save}
 *         saving={saving}
 *         rules={rules}
 *         statuses={statusesCatalog.options}
 *         onPickStatus={pickStatusId}
 *       />
 *     </>
 *   );
 * }
 */
export default function useAttendanceEditModal({
  statuses,
  setAttendances,
  setSummary,
  refetchAttendances,
}) {
  // Estado del modal
  const [open, setOpen] = useState(false);
  const [attendance, setAttendance] = useState(null);

  // Estado del formulario
  const [form, setForm] = useState({
    attendance_status_id: "",
    entry_hour: "",
    observations: "",
    absent_hours: "", // Solo lectura, calculado por el servidor
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  /**
   * Objeto del estado de asistencia seleccionado.
   * 
   * Busca en el catálogo de estados el que coincida con el ID seleccionado.
   * Memoizado para evitar búsquedas repetidas.
   * 
   * @returns {Object|null} Objeto estado con {id, code, name} o null
   */
  const selectedStatus = useMemo(() => {
    const id = Number(form.attendance_status_id);
    if (!id) return null;
    return statuses?.find((s) => Number(s.id) === id) || null;
  }, [statuses, form.attendance_status_id]);

  /**
   * Reglas de validación dinámicas según el estado seleccionado.
   * 
   * Si no hay estado seleccionado, usa reglas de "unregistered"
   * (no requiere nada).
   * 
   * Memoizado para evitar recálculos en cada render.
   */
  const rules = useMemo(() => {
    const code = selectedStatus?.code || "unregistered";
    return RULES_BY_CODE[code] || RULES_BY_CODE.unregistered;
  }, [selectedStatus?.code]);

  /**
   * Schema de validación dinámico.
   * 
   * Se reconstruye cuando cambian las reglas, adaptando
   * qué campos son required según el tipo de asistencia.
   * 
   * Memoizado para evitar recreación innecesaria.
   */
  const schema = useMemo(() => {
    return [
      { name: "attendance_status_id", type: "select", required: true },
      // entry_hour es required solo si requiresEntryHour es true
      { name: "entry_hour", type: "time", required: !!rules.requiresEntryHour },
      // observations es required solo si requiresDescription es true
      { name: "observations", type: "text", required: !!rules.requiresDescription, maxLength: 500 },
    ];
  }, [rules]);

  /**
   * Abre el modal con los datos de una asistencia.
   * 
   * - Guarda el registro de asistencia completo
   * - Limpia errores previos
   * - Inicializa el formulario con valores actuales
   * - Normaliza entry_hour al formato HH:MM
   * - Convierte absent_hours a string para display
   * 
   * useCallback previene recreación en cada render.
   * 
   * @param {Object} att - Objeto de asistencia a editar
   */
  const openModal = useCallback((att) => {
    setAttendance(att);
    setErrors({});

    setForm({
      // Convierte ID a string para el select
      attendance_status_id: att?.attendance_status?.id ? String(att.attendance_status.id) : "",
      // Normaliza tiempo a HH:MM
      entry_hour: normalizeTime(att?.entry_hour),
      observations: att?.observations || "",
      // Convierte número a string, maneja null/undefined
      absent_hours: att?.absent_hours != null ? String(att.absent_hours) : "",
    });

    setOpen(true);
  }, []);

  /**
   * Cierra el modal.
   * 
   * - Previene cierre si está guardando (evita pérdida de datos)
   * - Limpia el estado del modal
   * - Limpia errores
   * 
   * useCallback con dependencia [saving] permite acceso al valor actual.
   */
  const closeModal = useCallback(() => {
    if (saving) return; // Bloquea cierre durante guardado
    setOpen(false);
    setAttendance(null);
    setErrors({});
  }, [saving]);

  /**
   * Maneja cambios en los campos del formulario.
   * 
   * - Actualiza el valor del campo
   * - Limpia el error del campo cuando el usuario empieza a corregir
   * 
   * useCallback con dependencia [errors] para acceso al estado actual.
   */
  const onChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    },
    [errors]
  );

  /**
   * Función auxiliar para seleccionar un estado por ID.
   * 
   * Útil para implementar botones de selección rápida de estados:
   * - Botón "Presente" → pickStatusId(1)
   * - Botón "Ausente" → pickStatusId(2)
   * - etc.
   * 
   * También limpia el error del campo si existe.
   * 
   * @param {number|string} id - ID del estado a seleccionar
   */
  const pickStatusId = useCallback(
    (id) => {
      setForm((prev) => ({ ...prev, attendance_status_id: String(id) }));
      if (errors.attendance_status_id) {
        setErrors((prev) => ({ ...prev, attendance_status_id: "" }));
      }
    },
    [errors.attendance_status_id]
  );

  /**
   * Valida y guarda los cambios en el servidor.
   * 
   * Proceso completo:
   * 1. Validación con schema dinámico
   * 2. Verificación de que hay asistencia seleccionada
   * 3. **Actualización optimista**: actualiza UI inmediatamente
   * 4. Envío PATCH a la API
   * 5. Si falla: recarga datos (rollback)
   * 6. Si éxito: actualiza summary y absent_hours calculados
   * 7. Cierra el modal
   * 8. Muestra alerta de éxito
   * 
   * La actualización optimista mejora la UX percibida, pero el rollback
   * asegura consistencia si algo falla.
   * 
   * @async
   * @returns {Promise<boolean>} true si guardó correctamente, false si falló
   */
  const save = useCallback(async () => {
    // Paso 1: Validación
    const result = validarCamposReact(form, schema);
    if (!result.ok) {
      setErrors(result.errors || {});
      return false;
    }

    // Paso 2: Verificación de asistencia
    if (!attendance?.id) {
      await error("No hay asistencia seleccionada.");
      return false;
    }

    try {
      setSaving(true);

      const statusId = Number(form.attendance_status_id);
      
      // Construye el payload
      const payload = {
        attendance_status_id: statusId,
        entry_hour: form.entry_hour || null,
        observations: form.observations?.trim() ? form.observations.trim() : null,
      };

      // Busca el objeto completo del estado seleccionado
      const picked = statuses?.find((s) => Number(s.id) === statusId) || null;

      // Paso 3: Actualización optimista del estado local
      // Actualiza la UI ANTES de confirmar con el servidor
      setAttendances?.((curr) =>
        curr.map((a) =>
          a.id === attendance.id
            ? {
                ...a,
                entry_hour: payload.entry_hour,
                observations: payload.observations,
                attendance_status: picked
                  ? { id: picked.id, code: picked.code, name: picked.name }
                  : a.attendance_status,
              }
            : a
        )
      );

      // Paso 4: Envío a la API
      const res = await api.patch(`attendances/${attendance.id}`, payload);

      if (!res.ok) {
        await error(res.message || "No se pudo guardar la asistencia.");
        // Rollback: recarga datos desde el servidor
        await refetchAttendances?.();
        return false;
      }

      // Paso 5: Cierra el modal
      setOpen(false);
      await success(res.message || "Asistencia actualizada.");

      // Paso 6: Actualiza el summary si viene en la respuesta
      if (res.summary) setSummary?.(res.summary);

      // Paso 7: Actualiza campos calculados (absent_hours)
      // El servidor puede recalcular absent_hours basándose en entry_hour
      const computedId = res.data?.id;
      const computed = res.data?.computed;

      if (computedId && computed) {
        setAttendances?.((curr) =>
          curr.map((a) =>
            a.id === computedId
              ? {
                  ...a,
                  entry_hour: computed.entry_hour,
                  absent_hours: computed.absent_hours,
                }
              : a
          )
        );
      }

      return true;
    } catch (e) {
      await error(e?.message || "Error de conexión.");
      // Rollback en caso de error de red
      await refetchAttendances?.();
      return false;
    } finally {
      setSaving(false);
    }
  }, [attendance?.id, form, refetchAttendances, schema, setAttendances, setSummary, statuses]);

  return {
    open,
    attendance,
    form,
    errors,
    saving,
    rules,
    selectedStatus,
    openModal,
    closeModal,
    onChange,
    pickStatusId,
    save,
  };
}

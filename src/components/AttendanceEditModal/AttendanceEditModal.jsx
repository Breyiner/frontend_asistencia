// Importa los estilos específicos del modal de edición de asistencia
import "./AttendanceEditModal.css";

// Importa componentes reutilizables de UI
import Button from "../Button/Button";
import InputField from "../InputField/InputField";

// Importa iconos de la librería Remix Icon
// Cada icono representa un estado visual diferente de asistencia
import {
  RiCloseLine,           // Icono de cerrar (X)
  RiCheckboxCircleLine,  // Icono de check/presente
  RiCloseCircleLine,     // Icono de X en círculo/ausente
  RiShieldCheckLine,     // Icono de escudo/ausencia justificada
  RiLogoutCircleRLine,   // Icono de salida/salida temprana
  RiTimeLine,            // Icono de reloj/llegada tarde
  RiQuestionLine         // Icono de pregunta/sin registrar
} from "@remixicon/react";

/**
 * Objeto de configuración de UI por código de estado de asistencia.
 * 
 * Mapea cada código de estado a su configuración visual:
 * - tone: Color/tono del estado (success, danger, warning, etc.)
 * - Icon: Componente de icono correspondiente
 * 
 * @constant
 * @type {Object.<string, {tone: string, Icon: React.Component}>}
 */
const UI_BY_CODE = {
  present: { tone: "success", Icon: RiCheckboxCircleLine },          // Verde - Presente
  absent: { tone: "danger", Icon: RiCloseCircleLine },               // Rojo - Ausente
  excused_absence: { tone: "purple", Icon: RiShieldCheckLine },      // Morado - Ausencia justificada
  early_exit: { tone: "info", Icon: RiLogoutCircleRLine },           // Azul - Salida temprana
  late: { tone: "warning", Icon: RiTimeLine },                       // Amarillo - Llegada tarde
  unregistered: { tone: "neutral", Icon: RiQuestionLine},            // Gris - Sin registrar
};

/**
 * Retorna el subtítulo/mensaje auxiliar según el código de estado.
 * 
 * Algunos estados requieren información adicional que se indica
 * mediante este subtítulo descriptivo.
 * 
 * @function
 * @param {string} code - Código del estado de asistencia
 * @returns {string} Texto del subtítulo o string vacío si no aplica
 */
function subtitleByCode(code) {
  if (code === "excused_absence") return "Requiere descripción.";
  if (code === "early_exit") return "Requiere descripción.";
  if (code === "late") return "Requiere hora de llegada.";
  return "";
}

/**
 * Modal para editar el registro de asistencia de un aprendiz.
 * 
 * Permite seleccionar el estado de asistencia (presente, ausente, tarde, etc.)
 * y agregar información adicional según el estado seleccionado:
 * - Para "tarde": requiere hora de llegada y muestra horas ausentes calculadas
 * - Para "ausencia justificada" y "salida temprana": requiere descripción
 * 
 * El modal maneja validación de campos y estados de carga durante el guardado.
 * 
 * @component
 * 
 * @param {Object} props - Propiedades del componente
 * @param {boolean} props.open - Controla si el modal está visible
 * @param {Function} props.onClose - Callback para cerrar el modal
 * @param {boolean} props.saving - Indica si se está guardando (deshabilita controles)
 * @param {string} props.apprenticeName - Nombre del aprendiz cuya asistencia se edita
 * @param {Array} props.statuses - Lista de estados de asistencia disponibles
 * @param {Object} props.form - Objeto con los valores actuales del formulario
 * @param {string} props.form.attendance_status_id - ID del estado seleccionado
 * @param {string} props.form.entry_hour - Hora de llegada (formato time)
 * @param {string} props.form.absent_hours - Horas ausentes calculadas
 * @param {string} props.form.observations - Descripción/observaciones
 * @param {Object} props.errors - Objeto con mensajes de error por campo
 * @param {Object} props.rules - Reglas de validación/visualización
 * @param {boolean} props.rules.requiresEntryHour - Si debe mostrar campo de hora
 * @param {Object} props.selectedStatus - Objeto del estado actualmente seleccionado
 * @param {string} props.selectedStatus.code - Código del estado seleccionado
 * @param {Function} props.onPickStatusId - Callback al seleccionar un estado
 * @param {Function} props.onChange - Callback al cambiar valores de campos
 * @param {Function} props.onSave - Callback para guardar los cambios
 * 
 * @returns {JSX.Element|null} Modal de edición o null si no está abierto
 * 
 * @example
 * <AttendanceEditModal
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   saving={isSaving}
 *   apprenticeName="Juan Pérez"
 *   statuses={attendanceStatuses}
 *   form={formData}
 *   errors={validationErrors}
 *   rules={{ requiresEntryHour: true }}
 *   selectedStatus={currentStatus}
 *   onPickStatusId={handleStatusSelect}
 *   onChange={handleFieldChange}
 *   onSave={handleSave}
 * />
 */
export default function AttendanceEditModal({
  open,
  onClose,
  saving,

  apprenticeName,

  statuses,
  form,
  errors,
  rules,
  selectedStatus,

  onPickStatusId,
  onChange,
  onSave,
}) {
  // Si el modal no está abierto, no renderiza nada (early return)
  if (!open) return null;

  // Obtiene el código del estado seleccionado o usa "unregistered" como default
  const selectedCode = selectedStatus?.code || "unregistered";

  // Determina si debe mostrar el campo de horas ausentes como solo lectura
  // Solo aplica cuando el estado es "tarde" y ya hay un valor calculado
  const showAbsentHoursReadonly =
    selectedCode === "late" && form.absent_hours !== "";

  return (
    // Backdrop oscuro de fondo del modal con atributos de accesibilidad
    // role="dialog" indica que es un diálogo modal
    // aria-modal="true" indica que es modal (bloquea interacción con el resto)
    <div className="att-modal__backdrop" role="dialog" aria-modal="true">
      
      {/* Contenedor principal del modal */}
      <div className="att-modal">
        
        {/* Cabecera del modal con título y botón de cerrar */}
        <div className="att-modal__header">
          {/* Título que muestra el nombre del aprendiz o texto por defecto */}
          <div className="att-modal__title">{apprenticeName || "Editar asistencia"}</div>
          
          {/* Botón de cerrar (X) en la esquina superior derecha
              Se deshabilita durante el guardado para prevenir cierre accidental */}
          <button type="button" className="att-modal__close" onClick={onClose} disabled={saving}>
            <RiCloseLine size={20} />
          </button>
        </div>

        {/* Subtítulo instructivo */}
        <div className="att-modal__subtitle">Selecciona el estado de asistencia</div>

        {/* Grid de opciones de estado de asistencia */}
        <div className="att-modal__grid">
          
          {/* Mapea cada estado disponible a un botón seleccionable
              statuses es un array de objetos: { id, code, name } */}
          {statuses?.map((s) => {
            // Obtiene la configuración de UI para este estado o usa default
            const ui = UI_BY_CODE[s.code] || { tone: "neutral", Icon: RiCheckboxCircleLine };
            
            // Extrae el componente de icono
            const Icon = ui.Icon;
            
            // Determina si este estado está actualmente seleccionado
            // Convierte a String para comparación segura de tipos
            const active = String(form.attendance_status_id) === String(s.id);
            
            // Obtiene el subtítulo si este estado lo requiere
            const sub = subtitleByCode(s.code);

            return (
              // Botón para seleccionar este estado
              // La clase incluye el tono y la clase --active si está seleccionado
              <button
                key={s.id}
                type="button"
                className={`att-option att-option--${ui.tone} ${active ? "att-option--active" : ""}`}
                onClick={() => onPickStatusId(s.id)}
                disabled={saving}
              >
                {/* Icono del estado con color según el tono */}
                <div className={`att-option__icon att-option__icon--${ui.tone}`}>
                  <Icon size={20} />
                </div>

                {/* Contenedor de texto: nombre del estado y subtítulo opcional */}
                <div className="att-option__txt">
                  {/* Nombre del estado (ej: "Presente", "Ausente") */}
                  <div className="att-option__title">{s.name}</div>
                  
                  {/* Subtítulo solo si existe (ej: "Requiere descripción.") */}
                  {sub ? <div className="att-option__sub">{sub}</div> : null}
                </div>
              </button>
            );
          })}
        </div>

        {/* Sección de campos de entrada adicionales según el estado */}
        <div className="att-modal__fields">
          
          {/* Renderiza campos de hora solo si las reglas lo requieren
              Aplica para estado "tarde" principalmente */}
          {rules.requiresEntryHour ? (
            <div className="att-modal__row2">
              {/* Campo de hora de llegada (input tipo time) */}
              <InputField
                label="Hora de llegada"
                name="entry_hour"
                type="time"
                value={form.entry_hour}
                onChange={onChange}
                error={errors.entry_hour}
              />

              {/* Campo de horas ausentes (solo lectura, auto-calculado)
                  Solo se muestra si ya hay un valor calculado */}
              {showAbsentHoursReadonly ? (
                <InputField
                  label="Cantidad de horas ausente"
                  name="absent_hours"
                  type="text"
                  value={form.absent_hours}
                  onChange={() => {}} // onChange vacío porque es solo lectura
                  disabled
                />
              ) : (
                // Div vacío para mantener el layout de 2 columnas
                <div />
              )}
            </div>
          ) : null}

          {/* Campo de observaciones/descripción (textarea)
              Siempre visible, requerido para algunos estados */}
          <InputField
            label="Descripción"
            name="observations"
            type="textarea"
            value={form.observations}
            onChange={onChange}
            error={errors.observations}
            placeholder="Agrega una descripción..."
          />
        </div>

        {/* Footer del modal con botones de acción */}
        <div className="att-modal__footer">
          {/* Botón secundario para cancelar - cierra el modal sin guardar */}
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          
          {/* Botón principal para guardar - ejecuta la lógica de guardado
              Muestra "Guardando..." durante el proceso de guardado */}
          <Button variant="primary" onClick={onSave} disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
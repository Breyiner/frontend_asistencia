import EntityCard from "../EntityCard/EntityCard";
import IconActionButton from "../IconActionButton/IconActionButton";
import InfoRow from "../InfoRow/InfoRow";
import { RiDeleteBinLine, RiPencilLine } from "@remixicon/react";

// Utilidades de autenticación
import { can } from "../../utils/auth";

/**
 * Componente de tarjeta para mostrar información de una sesión de horario.
 * 
 * Presenta los detalles de una sesión individual del horario (día, franja horaria,
 * instructor y ambiente) en formato de tarjeta con acciones **protegidas por permisos Spatie**.
 * 
 * **Permisos requeridos**:
 * - schedule_sessions.update: botón Editar
 * - schedule_sessions.delete: botón Eliminar
 * 
 * La tarjeta muestra:
 * - Título: rango horario (start_time - end_time)
 * - Badges: día de la semana y franja horaria
 * - Información: instructor y ambiente asignados
 * - Acciones: botones para editar y eliminar (según permisos)
 * 
 * @component
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.session - Objeto con datos de la sesión de horario
 * @param {string} [props.session.start_time] - Hora de inicio (formato: HH:MM)
 * @param {string} [props.session.end_time] - Hora de fin (formato: HH:MM)
 * @param {Object} [props.session.day] - Objeto con información del día
 * @param {string} [props.session.day.name] - Nombre del día (ej: "Lunes")
 * @param {Object} [props.session.time_slot] - Objeto con información de la franja horaria
 * @param {string} [props.session.time_slot.name] - Nombre de la franja (ej: "Mañana")
 * @param {Object} [props.session.instructor] - Objeto con información del instructor
 * @param {string} [props.session.instructor.full_name] - Nombre completo del instructor
 * @param {Object} [props.session.classroom] - Objeto con información del ambiente
 * @param {string} [props.session.classroom.name] - Nombre del ambiente
 * @param {Function} [props.onEdit] - Callback ejecutado al hacer clic en editar
 * @param {Function} [props.onDelete] - Callback ejecutado al hacer clic en eliminar
 * 
 * @returns {JSX.Element} Tarjeta con información de la sesión
 */
export default function ScheduleSessionCard({ session, onEdit, onDelete }) {
  /**
   * Verificaciones de permisos Spatie para acciones de la sesión.
   * 
   * Los callbacks nulos NO ocultan botones - permisos + callbacks controlan.
   */
  const canUpdate = can("schedule_sessions.update");
  const canDelete = can("schedule_sessions.delete");

  // Construye el título mostrando el rango horario
  // Formato: "08:00 - 12:00"
  const title = `${session?.start_time || ""} - ${session?.end_time || ""}`;

  // Construye el array de badges (día y franja horaria)
  // filter(Boolean) remueve los badges null cuando no hay datos
  const badges = [
    // Badge morado para el día de la semana
    session?.day?.name ? { text: session.day.name, className: "badge--purple" } : null,
    // Badge sin color especial para la franja horaria
    session?.time_slot?.name ? { text: session.time_slot.name, className: "" } : null,
  ].filter(Boolean);

  // Construye el array de botones de acción
  const actions = [
    // Botón de editar (verde) - condiciones:
    // 1. Tiene permiso schedule_sessions.update
    // 2. Callback onEdit existe
    canUpdate && onEdit ? (
      <IconActionButton
        key="edit"
        title="Editar sesión"
        onClick={() => onEdit(session)}
        color="#007832"
      >
        <RiPencilLine size={19} />
      </IconActionButton>
    ) : null,

    // Botón de eliminar (rojo) - condiciones:
    // 1. Tiene permiso schedule_sessions.delete
    // 2. Callback onDelete existe
    canDelete && onDelete ? (
      <IconActionButton
        key="delete"
        title="Eliminar sesión"
        onClick={() => onDelete(session)}
        className="icon-action-btn--danger"
        color="#ef4444"
      >
        <RiDeleteBinLine size={19} />
      </IconActionButton>
    ) : null,
  ].filter(Boolean);

  return (
    <EntityCard title={title} badges={badges} actions={actions}>
      {/* Contenedor flex para mostrar información en dos columnas */}
      <div style={{ display: "flex", gap: "2.5rem", flexWrap: "wrap" }}>
        {/* Muestra "—" (em dash) si no hay instructor asignado */}
        <InfoRow 
          label="Instructor/a" 
          value={session?.instructor?.full_name || "—"} 
        />
        {/* Muestra "—" (em dash) si no hay ambiente asignado */}
        <InfoRow 
          label="Ambiente" 
          value={session?.classroom?.name || "—"} 
        />
      </div>
    </EntityCard>
  );
}

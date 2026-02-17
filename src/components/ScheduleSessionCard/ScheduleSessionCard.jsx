import EntityCard from "../EntityCard/EntityCard";
import IconActionButton from "../IconActionButton/IconActionButton";
import InfoRow from "../InfoRow/InfoRow";
import { RiDeleteBinLine, RiPencilLine } from "@remixicon/react";

/**
 * Componente de tarjeta para mostrar información de una sesión de horario.
 * 
 * Presenta los detalles de una sesión individual del horario (día, franja horaria,
 * instructor y ambiente) en formato de tarjeta con acciones de edición y eliminación.
 * 
 * La tarjeta muestra:
 * - Título: rango horario (start_time - end_time)
 * - Badges: día de la semana y franja horaria
 * - Información: instructor y ambiente asignados
 * - Acciones: botones para editar y eliminar
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
 * 
 * @example
 * <ScheduleSessionCard
 *   session={{
 *     id: 1,
 *     start_time: "08:00",
 *     end_time: "12:00",
 *     day: { name: "Lunes" },
 *     time_slot: { name: "Mañana" },
 *     instructor: { full_name: "Juan Pérez" },
 *     classroom: { name: "Ambiente 101" }
 *   }}
 *   onEdit={(session) => console.log("Editar", session)}
 *   onDelete={(session) => console.log("Eliminar", session)}
 * />
 */
export default function ScheduleSessionCard({ session, onEdit, onDelete }) {
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
    // Botón de editar (verde)
    <IconActionButton
      key="edit"
      title="Editar"
      onClick={() => onEdit?.(session)} // Optional chaining: solo ejecuta si onEdit existe
      color="#007832"
    >
      <RiPencilLine size={19} />
    </IconActionButton>,
    // Botón de eliminar (rojo)
    <IconActionButton
      key="delete"
      title="Eliminar"
      onClick={() => onDelete?.(session)} // Optional chaining: solo ejecuta si onDelete existe
      className="icon-action-btn--danger"
      color="#ef4444"
    >
      <RiDeleteBinLine size={19} />
    </IconActionButton>,
  ];

  return (
    <EntityCard title={title} badges={badges} actions={actions}>
      {/* Contenedor flex para mostrar información en dos columnas */}
      <div style={{ display: "flex", gap: "2.5rem", flexWrap: "wrap" }}>
        {/* Muestra "—" (em dash) si no hay instructor asignado */}
        <InfoRow label="Instructor/a" value={session?.instructor?.full_name || "—"} />
        {/* Muestra "—" (em dash) si no hay ambiente asignado */}
        <InfoRow label="Ambiente" value={session?.classroom?.name || "—"} />
      </div>
    </EntityCard>
  );
}

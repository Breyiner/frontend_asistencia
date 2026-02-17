import CardsSection from "../CardsSection/CardsSection";
import ScheduleSessionCard from "../ScheduleSessionCard/ScheduleSessionCard";

/**
 * Componente de lista para mostrar múltiples sesiones de horario.
 * 
 * Renderiza una sección de tarjetas que muestra todas las sesiones (días)
 * asignadas a un horario específico. Incluye botón para asociar nuevas
 * sesiones y maneja el estado vacío con mensaje personalizado.
 * 
 * Características:
 * - Lista de tarjetas de sesiones
 * - Botón de acción para asignar nuevos días
 * - Estado vacío con mensaje y acción
 * - Propagación de callbacks de edición y eliminación
 * 
 * @component
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array<Object>} [props.sessions=[]] - Array de objetos de sesión
 * @param {string} [props.associateTo] - Ruta para navegar al formulario de asociación
 * @param {Function} [props.onEdit] - Callback ejecutado al editar una sesión
 * @param {Function} [props.onDelete] - Callback ejecutado al eliminar una sesión
 * 
 * @returns {JSX.Element} Sección con lista de tarjetas de sesiones
 * 
 * @example
 * <ScheduleSessionsList
 *   sessions={[
 *     {
 *       id: 1,
 *       start_time: "08:00",
 *       end_time: "12:00",
 *       day: { name: "Lunes" },
 *       instructor: { full_name: "Juan Pérez" }
 *     },
 *     {
 *       id: 2,
 *       start_time: "14:00",
 *       end_time: "18:00",
 *       day: { name: "Martes" },
 *       instructor: { full_name: "María García" }
 *     }
 *   ]}
 *   associateTo="/schedules/1/sessions/create"
 *   onEdit={(session) => navigate(`/sessions/${session.id}/edit`)}
 *   onDelete={(session) => handleDelete(session.id)}
 * />
 */
export default function ScheduleSessionsList({
  sessions = [],
  associateTo,
  onEdit,
  onDelete,
}) {
  return (
    <CardsSection
      title="Días de Horario Asignados:"
      // Botón visible cuando hay sesiones
      actionTo={associateTo}
      actionLabel="+ Asignar Día"
      // Estado vacío
      emptyText="No hay días asignados"
      emptyActionLabel="+ Asignar Primer Día"
      // Array de sesiones a renderizar
      items={sessions}
      // Función de renderizado para cada sesión
      // key={s.id}: React necesita una key única para cada elemento de la lista
      renderItem={(s) => (
        <ScheduleSessionCard
          key={s.id}
          session={s}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    />
  );
}

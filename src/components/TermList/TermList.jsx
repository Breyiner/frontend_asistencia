import CardsSection from "../CardsSection/CardsSection";
import TrimestreCard from "../TermCard/TermCard";

/**
 * Componente de lista para mostrar múltiples trimestres.
 * 
 * Renderiza una sección de tarjetas que muestra todos los trimestres
 * asociados a una entidad (ficha, programa, etc.). Incluye botón para
 * asociar nuevos trimestres y maneja el estado vacío.
 * 
 * Características:
 * - Lista de tarjetas de trimestres
 * - Identificación visual del trimestre actual
 * - Botón de acción para asociar nuevos trimestres
 * - Estado vacío con mensaje y acción
 * - Propagación de callbacks de edición, eliminación y cambio de actual
 * - Soporte opcional para ver horarios de trimestres
 * 
 * @component
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array<Object>} [props.trimestres=[]] - Array de objetos de trimestre
 * @param {number} [props.currentId] - ID del trimestre actual
 * @param {string} [props.associateTo] - Ruta para navegar al formulario de asociación
 * @param {Function} [props.onEdit] - Callback ejecutado al editar un trimestre
 * @param {Function} [props.onDelete] - Callback ejecutado al eliminar un trimestre
 * @param {Function} [props.onSetCurrent] - Callback ejecutado al marcar trimestre como actual
 * @param {boolean} [props.showSchedule=false] - Si mostrar botón "Ver horario" en cada tarjeta
 * @param {Function} [props.onOpenSchedule] - Callback ejecutado al abrir horario de un trimestre
 * 
 * @returns {JSX.Element} Sección con lista de tarjetas de trimestres
 * 
 * @example
 * // Lista básica con trimestres
 * <TrimestresList
 *   trimestres={[
 *     {
 *       id: 1,
 *       term_name: "Trimestre 1 - 2026",
 *       phase_name: "Electiva",
 *       start_date: "2026-01-15",
 *       end_date: "2026-04-15",
 *       is_current: true
 *     },
 *     {
 *       id: 2,
 *       term_name: "Trimestre 2 - 2026",
 *       phase_name: "Lectiva",
 *       start_date: "2026-04-20",
 *       end_date: "2026-07-20"
 *     }
 *   ]}
 *   currentId={1}
 *   associateTo="/fichas/123/trimestres/associate"
 *   onEdit={(t) => navigate(`/trimestres/${t.id}/edit`)}
 *   onDelete={(t) => handleDelete(t.id)}
 *   onSetCurrent={(t) => handleSetCurrent(t.id)}
 * />
 * 
 * @example
 * // Lista con soporte de horarios
 * <TrimestresList
 *   trimestres={trimestres}
 *   currentId={currentTrimestreId}
 *   associateTo="/associate"
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 *   onSetCurrent={handleSetCurrent}
 *   showSchedule={true}
 *   onOpenSchedule={(t) => navigate(`/trimestres/${t.id}/schedule`)}
 * />
 */
export default function TrimestresList({
  trimestres = [],
  currentId,
  associateTo,

  onEdit,
  onDelete,
  onSetCurrent,

  showSchedule = false,
  onOpenSchedule,
}) {
  return (
    <CardsSection
      title="Trimestres Asociados"
      // Botón visible cuando hay trimestres
      actionTo={associateTo}
      actionLabel="+ Asociar Trimestre"
      // Estado vacío
      emptyText="No hay trimestres asociados"
      emptyActionLabel="+ Asociar Primer Trimestre"
      // Array de trimestres a renderizar
      items={trimestres}
      // Función de renderizado para cada trimestre
      renderItem={(t) => (
        <TrimestreCard
          key={t.id}
          trimestre={t}
          // Determina si es el trimestre actual de dos formas:
          // 1. Comparando con currentId recibido como prop
          // 2. Verificando la propiedad is_current del trimestre
          // El operador || asegura que funcione con ambos enfoques
          isCurrent={t.id === currentId || !!t.is_current}
          // Siempre permite marcar otro trimestre como actual
          showSetCurrent={true}
          onSetCurrent={onSetCurrent}
          onEdit={onEdit}
          onDelete={onDelete}
          // Propaga configuración de horarios
          showSchedule={showSchedule}
          onOpenSchedule={onOpenSchedule}
        />
      )}
    />
  );
}

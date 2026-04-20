// Sección de cards reutilizable
import CardsSection from "../CardsSection/CardsSection";

// Card individual del trimestre
import TrimestreCard from "../TermCard/TermCard";

/**
 * Lista de trimestres asociados.
 *
 * Requisito UX:
 * - Cuando `disabled` es true, se inhabilitan las acciones (editar/eliminar/setCurrent/ver horario)
 *   y se bloquea interacción en la sección (CardsSection) para evitar doble click.
 *
 * @param {Object} props Props del componente.
 * @param {Array<Object>} [props.trimestres=[]] Lista de trimestres.
 * @param {number} [props.currentId] ID del trimestre actual.
 * @param {string|null} [props.associateTo] Ruta a asociar trimestre (Link).
 * @param {Function|null} [props.onEdit] Callback editar.
 * @param {Function|null} [props.onDelete] Callback eliminar.
 * @param {Function|null} [props.onSetCurrent] Callback marcar actual.
 * @param {boolean} [props.showSchedule=false] Mostrar botón de horario.
 * @param {Function|null} [props.onOpenSchedule] Callback abrir horario.
 * @param {boolean} [props.disabled=false] Bloqueo global de interacción.
 * @returns {JSX.Element}
 */
export default function TrimestresList({
  // Lista de trimestres
  trimestres = [],
  // ID del actual
  currentId,
  // Ruta de asociar
  associateTo,

  // Callbacks
  onEdit,
  onDelete,
  onSetCurrent,

  // Horario
  showSchedule = false,
  onOpenSchedule,

  // Bloqueo global
  disabled = false,
}) {
  return (
    <CardsSection
      // Título visible
      title="Trimestres Asociados"
      // Link de acción (se deshabilita internamente si disabled)
      actionTo={associateTo}
      // Label del link
      actionLabel="+ Asociar Trimestre"
      // Texto cuando está vacío
      emptyText="No hay trimestres asociados"
      // Lista de ítems
      items={trimestres}
      // Bloqueo del contenedor completo (overlay + pointer-events none)
      disabled={disabled}
      // Texto del overlay
      disabledText="Procesando..."
      // Render por item
      renderItem={(t) => (
        <TrimestreCard
          // Key estable
          key={t.id}
          // Data del trimestre
          trimestre={t}
          // Determina actual por currentId o flag del backend
          isCurrent={t.id === currentId || !!t.is_current}
          // Siempre muestra “marcar actual” (tu lógica)
          showSetCurrent={true}
          // Si está disabled, anulamos callbacks para reforzar
          onSetCurrent={disabled ? null : onSetCurrent}
          onEdit={disabled ? null : onEdit}
          onDelete={disabled ? null : onDelete}
          // Horario
          showSchedule={showSchedule}
          onOpenSchedule={disabled ? null : onOpenSchedule}
          // Flag para estilos internos (si tu card lo usa)
          disabled={disabled}
        />
      )}
    />
  );
}

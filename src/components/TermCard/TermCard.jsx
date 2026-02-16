import InfoRow from "../InfoRow/InfoRow";
import EntityCard from "../EntityCard/EntityCard";
import IconActionButton from "../IconActionButton/IconActionButton";
import {
  RiDeleteBinLine,
  RiPencilLine,
  RiCheckLine,
  RiCalendarScheduleLine,
} from "@remixicon/react";

/**
 * Componente de tarjeta para mostrar información de un trimestre.
 * 
 * Presenta los detalles de un trimestre (nombre, fase, fechas) en formato
 * de tarjeta con múltiples acciones disponibles. Soporta indicador visual
 * de trimestre activo/actual.
 * 
 * La tarjeta muestra:
 * - Título: nombre del trimestre
 * - Badge: fase a la que pertenece
 * - Información: fechas de inicio y fin
 * - Estado visual: resaltado si es el trimestre actual
 * - Acciones condicionales: hacer actual, ver horario, editar, eliminar
 * 
 * @component
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.trimestre - Objeto con datos del trimestre
 * @param {string} [props.trimestre.term_name] - Nombre del trimestre (formato nuevo)
 * @param {string} [props.trimestre.nombre] - Nombre del trimestre (formato legacy)
 * @param {string} [props.trimestre.phase_name] - Nombre de la fase (formato nuevo)
 * @param {Object} [props.trimestre.fase] - Objeto fase (formato legacy)
 * @param {string} [props.trimestre.fase.nombre] - Nombre de la fase (formato legacy)
 * @param {string} [props.trimestre.start_date] - Fecha de inicio (formato nuevo)
 * @param {string} [props.trimestre.desde] - Fecha de inicio (formato legacy)
 * @param {string} [props.trimestre.end_date] - Fecha de fin (formato nuevo)
 * @param {string} [props.trimestre.hasta] - Fecha de fin (formato legacy)
 * @param {boolean} [props.isCurrent=false] - Si este es el trimestre actual/activo
 * @param {Function} [props.onEdit] - Callback ejecutado al editar
 * @param {Function} [props.onDelete] - Callback ejecutado al eliminar
 * @param {Function} [props.onSetCurrent] - Callback ejecutado al marcar como actual
 * @param {boolean} [props.showSetCurrent=false] - Si mostrar botón "Hacer actual"
 * @param {boolean} [props.showSchedule=false] - Si mostrar botón "Ver horario"
 * @param {Function} [props.onOpenSchedule] - Callback ejecutado al abrir horario
 * 
 * @returns {JSX.Element} Tarjeta con información del trimestre
 * 
 * @example
 * // Trimestre actual
 * <TrimestreCard
 *   trimestre={{
 *     id: 1,
 *     term_name: "Trimestre 1 - 2026",
 *     phase_name: "Electiva",
 *     start_date: "2026-01-15",
 *     end_date: "2026-04-15",
 *     is_current: true
 *   }}
 *   isCurrent={true}
 *   showSetCurrent={true}
 *   onEdit={(t) => navigate(`/trimestres/${t.id}/edit`)}
 *   onDelete={(t) => handleDelete(t.id)}
 *   onSetCurrent={(t) => handleSetCurrent(t.id)}
 * />
 * 
 * @example
 * // Trimestre con horario
 * <TrimestreCard
 *   trimestre={{
 *     id: 2,
 *     term_name: "Trimestre 2 - 2026",
 *     phase_name: "Lectiva",
 *     start_date: "2026-04-20",
 *     end_date: "2026-07-20"
 *   }}
 *   isCurrent={false}
 *   showSchedule={true}
 *   onOpenSchedule={(t) => navigate(`/trimestres/${t.id}/schedule`)}
 *   onEdit={(t) => handleEdit(t)}
 *   onDelete={(t) => handleDelete(t)}
 * />
 */
export default function TrimestreCard({
  trimestre,
  isCurrent,
  onEdit,
  onDelete,
  onSetCurrent,
  showSetCurrent = false,

  showSchedule = false,
  onOpenSchedule,
}) {
  // Construye el array de botones de acción
  // filter(Boolean) remueve los botones null (cuando no cumplen condiciones)
  const actions = [
    // Botón "Hacer actual" - solo visible si:
    // 1. showSetCurrent es true
    // 2. NO es el trimestre actual (isCurrent es false)
    // 3. El callback onSetCurrent existe
    showSetCurrent && !isCurrent && onSetCurrent ? (
      <IconActionButton
        key="setcurrent"
        title="Hacer actual"
        onClick={() => onSetCurrent(trimestre)}
        color="#012779" // Azul oscuro
      >
        <RiCheckLine size={19} />
      </IconActionButton>
    ) : null,
    
    // Botón "Ver horario" - solo visible si:
    // 1. showSchedule es true
    // 2. El callback onOpenSchedule existe
    showSchedule && onOpenSchedule ? (
      <IconActionButton
        key="schedule"
        title="Ver horario del trimestre"
        onClick={() => onOpenSchedule(trimestre)}
        color="#0f172a" // Negro slate
      >
        <RiCalendarScheduleLine size={19} />
      </IconActionButton>
    ) : null,
    
    // Botón "Editar" - siempre visible
    <IconActionButton
      key="edit"
      title="Editar"
      onClick={() => onEdit(trimestre)}
      color="#007832" // Verde
    >
      <RiPencilLine size={19} />
    </IconActionButton>,

    // Botón "Eliminar" - siempre visible
    <IconActionButton
      key="delete"
      title="Eliminar"
      onClick={() => onDelete(trimestre)}
      className="icon-action-btn--danger"
      color="#ef4444" // Rojo
    >
      <RiDeleteBinLine size={19} />
    </IconActionButton>,
  ].filter(Boolean);

  return (
    <EntityCard
      // Soporta múltiples formatos de nombres (nuevo y legacy)
      title={trimestre.term_name || trimestre.nombre || "Trimestre"}
      // isActive: aplica estilos visuales especiales si es el trimestre actual
      isActive={isCurrent}
      // Badge con el nombre de la fase
      badges={[
        { text: trimestre.phase_name || trimestre.fase?.nombre || "Fase", className: "" },
      ]}
      actions={actions}
    >
      {/* Contenedor flex para mostrar fechas en dos columnas */}
      {/* gap: "20%" mantiene espaciado proporcional entre columnas */}
      <div style={{ display: "flex", gap: "20%" }}>
        {/* Soporta múltiples formatos de fechas (nuevo y legacy) */}
        <InfoRow label="Desde" value={trimestre.start_date || trimestre.desde} />
        <InfoRow label="Hasta" value={trimestre.end_date || trimestre.hasta} />
      </div>
    </EntityCard>
  );
}

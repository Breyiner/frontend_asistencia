import InfoRow from "../InfoRow/InfoRow";
import EntityCard from "../EntityCard/EntityCard";
import IconActionButton from "../IconActionButton/IconActionButton";
import {
  RiDeleteBinLine,
  RiPencilLine,
  RiCheckLine,
  RiCalendarScheduleLine,
} from "@remixicon/react";

// Utilidades de autenticación
import { can } from "../../utils/auth";

/**
 * Componente de tarjeta para mostrar información de un trimestre.
 * 
 * Presenta los detalles de un trimestre (nombre, fase, fechas) en formato
 * de tarjeta con múltiples acciones disponibles **protegidas por permisos Spatie**.
 * Soporta indicador visual de trimestre activo/actual.
 * 
 * Permisos requeridos:
 * - ficha_terms.update: botón Editar
 * - ficha_terms.delete: botón Eliminar  
 * - ficha_terms.setCurrent: botón "Hacer actual"
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
  /**
   * Verificaciones de permisos Spatie para acciones CRUD.
   * Los callbacks nulos NO ocultan botones - permisos controlan visibilidad.
   */
  const canUpdate = can("ficha_terms.update");
  const canDelete = can("ficha_terms.delete");
  const canSetCurrent = can("ficha_terms.setCurrent");

  // Construye el array de botones de acción
  // filter(Boolean) remueve solo botones genuinamente nulos
  const actions = [
    // Botón "Hacer actual" - condiciones:
    // 1. showSetCurrent=true
    // 2. NO es trimestre actual
    // 3. Tiene permiso ficha_terms.setCurrent
    // 4. Callback onSetCurrent existe
    showSetCurrent && !isCurrent && canSetCurrent && onSetCurrent ? (
      <IconActionButton
        key="setcurrent"
        title="Hacer trimestre actual"
        onClick={() => onSetCurrent(trimestre)}
        color="#012779" // Azul oscuro
      >
        <RiCheckLine size={19} />
      </IconActionButton>
    ) : null,
    
    // Botón "Ver horario" - solo condiciones de prop:
    // 1. showSchedule=true
    // 2. Callback onOpenSchedule existe
    // Nota: NO requiere permiso específico (lectura pública)
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
    
    // Botón "Editar" - condiciones:
    // 1. Tiene permiso ficha_terms.update
    // 2. Callback onEdit existe
    canUpdate && onEdit ? (
      <IconActionButton
        key="edit"
        title="Editar trimestre"
        onClick={() => onEdit(trimestre)}
        color="#007832" // Verde
      >
        <RiPencilLine size={19} />
      </IconActionButton>
    ) : null,

    // Botón "Eliminar" - condiciones:
    // 1. Tiene permiso ficha_terms.delete
    // 2. Callback onDelete existe
    canDelete && onDelete ? (
      <IconActionButton
        key="delete"
        title="Eliminar trimestre"
        onClick={() => onDelete(trimestre)}
        className="icon-action-btn--danger"
        color="#ef4444" // Rojo
      >
        <RiDeleteBinLine size={19} />
      </IconActionButton>
    ) : null,
  ].filter(Boolean);

  return (
    <EntityCard
      // Soporta múltiples formatos de nombres (nuevo y legacy)
      title={trimestre.term_name || trimestre.nombre || "Trimestre"}
      // isActive: aplica estilos visuales especiales si es el trimestre actual
      isActive={isCurrent}
      // Badge con el nombre de la fase
      badges={[
        { 
          text: trimestre.phase_name || trimestre.fase?.nombre || "Fase", 
          className: "badge-phase" 
        },
      ]}
      actions={actions}
    >
      {/* Contenedor flex para mostrar fechas en dos columnas */}
      {/* gap: "20%" mantiene espaciado proporcional entre columnas */}
      <div style={{ display: "flex", gap: "20%" }}>
        {/* Soporta múltiples formatos de fechas (nuevo y legacy) */}
        <InfoRow 
          label="Desde" 
          value={trimestre.start_date || trimestre.desde || "—"} 
        />
        <InfoRow 
          label="Hasta" 
          value={trimestre.end_date || trimestre.hasta || "—"} 
        />
      </div>
    </EntityCard>
  );
}

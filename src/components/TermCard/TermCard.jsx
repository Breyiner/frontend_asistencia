import InfoRow from "../InfoRow/InfoRow";
import EntityCard from "../EntityCard/EntityCard";
import IconActionButton from "../IconActionButton/IconActionButton";
import {
  RiDeleteBinLine,
  RiPencilLine,
  RiCheckLine,
  RiCalendarScheduleLine,
} from "@remixicon/react";

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
  const actions = [
    showSetCurrent && !isCurrent && onSetCurrent ? (
      <IconActionButton
      key="setcurrent"
      title="Hacer actual"
      onClick={() => onSetCurrent(trimestre)}
      color="#012779"
      >
        <RiCheckLine size={19} />
      </IconActionButton>
    ) : null,
    
    showSchedule && onOpenSchedule ? (
      <IconActionButton
        key="schedule"
        title="Ver horario del trimestre"
        onClick={() => onOpenSchedule(trimestre)}
        color="#0f172a"
      >
        <RiCalendarScheduleLine size={19} />
      </IconActionButton>
    ) : null,
    
    <IconActionButton
      key="edit"
      title="Editar"
      onClick={() => onEdit(trimestre)}
      color="#007832"
    >
      <RiPencilLine size={19} />
    </IconActionButton>,

    <IconActionButton
      key="delete"
      title="Eliminar"
      onClick={() => onDelete(trimestre)}
      className="icon-action-btn--danger"
      color="#ef4444"
    >
      <RiDeleteBinLine size={19} />
    </IconActionButton>,
  ].filter(Boolean);

  return (
    <EntityCard
      title={trimestre.term_name || trimestre.nombre || "Trimestre"}
      isActive={isCurrent}
      badges={[
        { text: trimestre.phase_name || trimestre.fase?.nombre || "Fase", className: "" },
      ]}
      actions={actions}
    >
      <div style={{ display: "flex", gap: "20%" }}>
        <InfoRow label="Desde" value={trimestre.start_date || trimestre.desde} />
        <InfoRow label="Hasta" value={trimestre.end_date || trimestre.hasta} />
      </div>
    </EntityCard>
  );
}

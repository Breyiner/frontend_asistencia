import EntityCard from "../EntityCard/EntityCard";
import IconActionButton from "../IconActionButton/IconActionButton";
import InfoRow from "../InfoRow/InfoRow";
import { RiDeleteBinLine, RiPencilLine } from "@remixicon/react";

export default function ScheduleSessionCard({ session, onEdit, onDelete }) {
  const title = `${session?.start_time || ""} - ${session?.end_time || ""}`;

  const badges = [
    session?.day?.name ? { text: session.day.name, className: "badge--purple" } : null,
    session?.shift?.name ? { text: session.shift.name, className: "" } : null,
  ].filter(Boolean);

  const actions = [
    <IconActionButton
      key="edit"
      title="Editar"
      onClick={() => onEdit?.(session)}
      color="#007832"
    >
      <RiPencilLine size={19} />
    </IconActionButton>,
    <IconActionButton
      key="delete"
      title="Eliminar"
      onClick={() => onDelete?.(session)}
      className="icon-action-btn--danger"
      color="#ef4444"
    >
      <RiDeleteBinLine size={19} />
    </IconActionButton>,
  ];

  return (
    <EntityCard title={title} badges={badges} actions={actions}>
      <div style={{ display: "flex", gap: "2.5rem", flexWrap: "wrap" }}>
        <InfoRow label="Instructor/a" value={session?.instructor?.full_name || "—"} />
        <InfoRow label="Ambiente" value={session?.classroom?.name || "—"} />
      </div>
    </EntityCard>
  );
}
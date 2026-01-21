import CardsSection from "../CardsSection/CardsSection";
import ScheduleSessionCard from "../ScheduleSessionCard/ScheduleSessionCard";

export default function ScheduleSessionsList({
  sessions = [],
  associateTo,
  onEdit,
  onDelete,
}) {
  return (
    <CardsSection
      title="Días de Horario Asignados:"
      actionTo={associateTo}
      actionLabel="+ Asignar Día"
      emptyText="No hay días asignados"
      emptyActionLabel="+ Asignar Primer Día"
      items={sessions}
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
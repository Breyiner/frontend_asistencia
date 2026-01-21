import CardsSection from "../CardsSection/CardsSection";
import TrimestreCard from "../TermCard/TermCard";

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
      actionTo={associateTo}
      actionLabel="+ Asociar Trimestre"
      emptyText="No hay trimestres asociados"
      emptyActionLabel="+ Asociar Primer Trimestre"
      items={trimestres}
      renderItem={(t) => (
        <TrimestreCard
          key={t.id}
          trimestre={t}
          isCurrent={t.id === currentId || !!t.is_current}
          showSetCurrent={true}
          onSetCurrent={onSetCurrent}
          onEdit={onEdit}
          onDelete={onDelete}
          showSchedule={showSchedule}
          onOpenSchedule={onOpenSchedule}
        />
      )}
    />
  );
}

import CardsSection from "../CardsSection/CardsSection";
import TrimestreCard from "../TermCard/TermCard";

export default function TrimestresList({
  trimestres = [],
  currentId,
  associateTo,
  editTo,
  onDelete,
  onSetCurrent,
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
          onEdit={() => editTo && editTo(t)}
          onDelete={() => onDelete && onDelete(t)}
        />
      )}
    />
  );
}
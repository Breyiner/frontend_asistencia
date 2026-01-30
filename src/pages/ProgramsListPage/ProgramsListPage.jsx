import DataListLayout from "../../components/DataList/DataListLayout";
import "../../components/Badge/Badge.css";
import BadgesCompact from "../../components/BadgesCompact/BadgesCompact";

export default function ProgramsListPage() {
  return (
    <DataListLayout
      title="Listado de Programas de Formación"
      endpoint="training_programs"
      createPath="/training_programs/create"
      initialFilters={{ per_page: 10 }}
      rowClickPath={(p) => `/training_programs/${p.id}`}
      filtersConfig={[
        {
          name: "program_name",
          label: "Nombre",
          placeholder: "Nombre",
          defaultValue: "",
          withSearchIcon: true,
        },
        {
          name: "area_name",
          label: "Área",
          placeholder: "Área",
          defaultValue: "",
        },
        {
          name: "qualification_level_name",
          label: "Nivel",
          placeholder: "Nivel",
          defaultValue: "",
        },
      ]}
      tableColumns={[
        { key: "name", label: "Nombre" },
        { key: "area_name", label: "Área" },
        { key: "fichas_count", label: "Fichas Relacionadas" },
        { key: "duration", label: "Duración" },
        {
          key: "qualification_level_name",
          label: "Nivel",
          render: (p) => (
            <BadgesCompact items={[p.qualification_level_name]} maxVisible={1} badgeClassName="badge" />
          ),
        },
      ]}
    />
  );
}
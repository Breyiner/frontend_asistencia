import DataListLayout from "../../components/DataList/DataListLayout";
import "../../components/Badge/Badge.css";
import BadgesCompact from "../../components/BadgesCompact/BadgesCompact";

export default function AreasListPage() {
  return (
    <DataListLayout
      title="Listado de Áreas"
      endpoint="areas"
      createPath="/areas/create"
      initialFilters={{ per_page: 10 }}
      rowClickPath={(a) => `/areas/${a.id}`}
      filtersConfig={[
        {
          name: "area_name",
          label: "Nombre",
          placeholder: "Nombre",
          defaultValue: "",
          withSearchIcon: true,
        }
      ]}
      tableColumns={[
        { key: "name", label: "Nombre" },
        { key: "description", label: "Descripción" },
        { key: "training_programs_count", label: "Programas Relacionados" }
      ]}
    />
  );
}
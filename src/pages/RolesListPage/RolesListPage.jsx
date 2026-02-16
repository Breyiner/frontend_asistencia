import DataListLayout from "../../components/DataList/DataListLayout";
import "../../components/Badge/Badge.css";
import BadgesCompact from "../../components/BadgesCompact/BadgesCompact";

export default function RolesListPage() {
  return (
    <DataListLayout
      title="Listado de Áreas"
      endpoint="roles"
      createPath="/roles/create"
      initialFilters={{ per_page: 10 }}
      rowClickPath={(r) => `/roles/${r.id}`}
      filtersConfig={[
        {
          name: "role_name",
          label: "Nombre",
          placeholder: "Nombre",
          defaultValue: "",
          withSearchIcon: true,
        }
      ]}
      tableColumns={[
        { key: "name", label: "Nombre" },
        { key: "description", label: "Descripción" },
        { key: "code", label: "Código" },
        { key: "users_count", label: "Usuarios Relacionados" }
      ]}
    />
  );
}
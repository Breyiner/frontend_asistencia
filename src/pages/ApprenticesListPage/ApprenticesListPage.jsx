import DataListLayout from "../../components/DataList/DataListLayout";
import "../../components/Badge/Badge.css";
import BadgesCompact from "../../components/BadgesCompact/BadgesCompact";

export default function ApprentincesListPage() {
  return (
    <DataListLayout
      title="Listado de Aprendices"
      endpoint="apprentices"
      createPath="/apprentices/create"
      initialFilters={{ per_page: 10 }}
      rowClickPath={(u) => `/apprentices/${u.id}`}
      filtersConfig={[
        {
          name: "first_name",
          label: "Nombres",
          placeholder: "Nombres",
          defaultValue: "",
          withSearchIcon: true,
        },
        {
          name: "last_name",
          label: "Apellidos",
          placeholder: "Apellidos",
          defaultValue: "",
        },
        {
          name: "document_number",
          label: "Número de documento",
          placeholder: "Número de documento",
          advanced: true,
        },
        {
          name: "email",
          label: "Correo",
          placeholder: "Correo electrónico",
          advanced: true,
        },
        {
          name: "ficha_number",
          label: "Ficha",
          placeholder: "Ficha",
          advanced: true,
        },
        {
          name: "status_name",
          label: "Estado",
          placeholder: "Estado",
          advanced: true,
        },
      ]}
      tableColumns={[
        { key: "document_number", label: "Documento" },
        { key: "first_name", label: "Nombres" },
        { key: "last_name", label: "Apellidos" },
        { key: "email", label: "Correo" },
        { key: "ficha_number", label: "Ficha" },
        {
          key: "status",
          label: "Estado",
          render: (u) => (
            <BadgesCompact
              items={[u.status]}
              maxVisible={1}
              badgeClassName={`badge badge--${u.status === "Activo" ? "green" : "brown"}`}
            />
          )
        },
      ]}
    />
  );
}

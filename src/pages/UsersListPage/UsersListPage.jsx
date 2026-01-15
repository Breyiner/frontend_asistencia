import DataListLayout from "../../components/DataList/DataListLayout";
import "../../components/Badge/Badge.css";

export default function UsersListPage() {
  return (
    <DataListLayout
      title="Listado de Usuarios"
      endpoint="users"
      createPath="/users/create"
      initialFilters={{ per_page: 10 }}
      rowClickPath={(u) => `/users/${u.id}`}
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
          name: "role_name",
          label: "Rol",
          placeholder: "Rol",
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
        { key: "document_number", label: "Documento"},
        { key: "first_name", label: "Nombres" },
        { key: "last_name", label: "Apellidos" },
        { key: "email", label: "Correo" },
        {
          key: "roles",
          label: "Roles",
          render: (u) =>
            u.roles.map((rol) => (
              <span className="badge badge--role">{rol}</span>
            )),
        },
        {
          key: "status",
          label: "Estado",
          render: (u) => (
            <span
              className={`badge badge--status badge--status-${
                u.status === "Activo" ? "active" : "inactive"
              }`}
            >
              {u.status}
            </span>
          ),
        },
      ]}
    />
  );
}

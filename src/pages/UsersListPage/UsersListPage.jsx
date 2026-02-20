// Componente genérico de layout de tablas paginadas
import DataListLayout from "../../components/DataList/DataListLayout";

// Estilos requeridos para badges en columnas render
import "../../components/Badge/Badge.css";

// Componente para mostrar múltiples badges compactos
import BadgesCompact from "../../components/BadgesCompact/BadgesCompact";

// Utilidades de autenticación y permisos
import { can } from "../../utils/auth";

/**
 * Página de listado completo de usuarios del sistema.
 * 
 * Tabla paginada avanzada con 6 filtros y 8 columnas especializadas.
 * 
 * Control de permisos con `can()`
 */
export default function UsersListPage() {
  // ← NUEVO: Permisos usando solo `can()` utility
  const canCreate = can("users.create");
  const canViewDetail = can("users.view");

  // Render único: DataListLayout completamente configurado
  return (
    <DataListLayout
      title="Listado de Usuarios"
      endpoint="users"
      /* ← Botón crear SOLO si tiene permiso */
      createPath={canCreate ? "/users/create" : null}
      initialFilters={{ per_page: 10 }}
      /* ← Navegación a detalle SOLO si tiene permiso */
      rowClickPath={canViewDetail ? (u) => `/users/${u.id}` : null}

      // Configuración de 6 filtros (2 básicos + 4 avanzados)
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

      // 8 columnas con 3 renders personalizados usando BadgesCompact
      tableColumns={[
        { key: "document_number", label: "Documento" },
        { key: "first_name", label: "Nombres" },
        { key: "last_name", label: "Apellidos" },
        { key: "email", label: "Correo" },
        {
          key: "areas",
          label: "Áreas",
          render: (u) => (
            <BadgesCompact
              items={u.areas}
              maxVisible={1}
              badgeClassName="badge badge--brown"
              moreClassName="badge badge--fill-neutral"
            />
          ),
        },
        {
          key: "roles",
          label: "Roles",
          render: (u) => (
            <BadgesCompact
              items={u.roles}
              maxVisible={1}
              badgeClassName="badge badge--purple"
              moreClassName="badge badge--fill-neutral"
            />
          ),
        },
        {
          key: "status",
          label: "Estado",
          render: (u) => (
            <BadgesCompact
              items={[u.status]}
              maxVisible={1}
              badgeClassName={`badge badge--${
                u.status === "Activo" ? "green" : "brown"
              }`}
            />
          ),
        },
      ]}
    />
  );
}

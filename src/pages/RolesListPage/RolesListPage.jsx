// Componente genérico de layout de listas paginadas
import DataListLayout from "../../components/DataList/DataListLayout";

// Estilos globales para badges utilizados en la tabla
import "../../components/Badge/Badge.css";

// Utilidades de autenticación y permisos
import { can } from "../../utils/auth";

/**
 * Página de listado de roles del sistema.
 * 
 * Interfaz de tabla paginada simple para gestión de roles.
 * Utiliza DataListLayout genérico con configuración mínima.
 * 
 *  Control de permisos con `can()`
 * 
 * @component
 * @returns {JSX.Element} Tabla paginada de roles con filtro simple
 */
export default function RolesListPage() {
  // ← NUEVO: Permisos usando solo `can()` utility
  const canCreate = can("roles.create");
  const canViewDetail = can("roles.show");

  // Render único: DataListLayout completamente configurado
  return (
    <DataListLayout
      title="Listado de Roles"                           // Título consistente
      endpoint="roles"                                   // API endpoint correcto: /roles
      /* ← Botón crear SOLO si tiene permiso */
      createPath={canCreate ? "/roles/create" : null}    // Ruta de creación condicional
      initialFilters={{ per_page: 10 }}                  // Paginación inicial: 10 por página
      /* ← Navegación a detalle SOLO si tiene permiso */
      rowClickPath={canViewDetail ? (r) => `/roles/${r.id}` : null} // Navegación protegida
      filtersConfig={[
        {
          name: "role_name",           // Campo de búsqueda en backend
          label: "Nombre",             // Etiqueta visible para usuario
          placeholder: "Nombre",       // Texto hint en input vacío
          defaultValue: "",            // Valor inicial vacío
          withSearchIcon: true,        // Muestra icono de lupa
        }
      ]}
      tableColumns={[
        { 
          key: "name", 
          label: "Nombre"              // Columna principal: nombre legible
        },
        { 
          key: "description", 
          label: "Descripción"         // Columna secundaria: texto descriptivo
        },
        { 
          key: "code", 
          label: "Código"              // Columna técnica: identificador único
        },
        { 
          key: "users_count", 
          label: "Usuarios Relacionados" // Columna métrica: conteo de usuarios
        }
      ]}
    />
  );
}

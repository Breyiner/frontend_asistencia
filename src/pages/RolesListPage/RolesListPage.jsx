// Componente genérico de layout de listas paginadas
import DataListLayout from "../../components/DataList/DataListLayout"; // Componente reutilizable para tablas

// Estilos globales para badges utilizados en la tabla
import "../../components/Badge/Badge.css"; // Estilos CSS globales requeridos

/**
 * Página de listado de roles del sistema.
 * 
 * Interfaz de tabla paginada simple para gestión de roles.
 * Utiliza DataListLayout genérico con configuración mínima.
 * 
 * **NOTA**: Título inconsistente "Listado de Áreas" vs endpoint "roles"
 * 
 * Características:
 * - Filtro único: nombre del rol (con icono de búsqueda)
 * - Paginación server-side (10 registros por página)
 * - Navegación directa a detalle por click en fila
 * - Sin verificación de permisos para crear (siempre visible)
 * - Columnas informativas: nombre, descripción, código, usuarios
 * 
 * Columnas mostradas:
 * 1. name: Nombre legible del rol
 * 2. description: Descripción del rol
 * 3. code: Código interno único (ej: "ADMIN")
 * 4. users_count: Cantidad de usuarios con este rol
 * 
 * Flujo:
 * 1. Carga inicial página 1 (10 roles)
 * 2. Filtro por nombre actualiza tabla reactivamente
 * 3. Click fila → /roles/{id}
 * 4. Filtros persisten en query params de URL
 * 
 * @component
 * @returns {JSX.Element} Tabla paginada de roles con filtro simple
 */
export default function RolesListPage() {
  // Render único: DataListLayout completamente configurado
  return (
    <DataListLayout
      title="Listado de Áreas" // ❌ INCONSISTENTE: debería ser "Listado de Roles"
      endpoint="roles"         // API endpoint correcto: /roles
      createPath="/roles/create" // Ruta de creación (siempre visible, sin permiso)
      initialFilters={{ per_page: 10 }} // Paginación inicial: 10 por página
      rowClickPath={(r) => `/roles/${r.id}`} // Navegación a detalle por ID
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

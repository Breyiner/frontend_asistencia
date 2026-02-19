// Componente principal de listado de datos
import DataListLayout from "../../components/DataList/DataListLayout";

// Utilidades de autenticación
import { can } from "../../utils/auth";

// Estilos del badge
import "../../components/Badge/Badge.css";

/**
 * Página de listado completo de ambientes (aulas/salones) del sistema.
 * 
 * Interfaz paginada con filtros y navegación protegida por permisos:
 * - classrooms.viewAny: acceso a la lista
 * - classrooms.create: botón "Crear Ambiente" + ruta createPath
 * 
 * Características:
 * - Paginación (10 por página por defecto)
 * - Filtro por nombre (búsqueda en tiempo real)
 * - Columnas: nombre, descripción
 * - Navegación a detalle por doble clic en fila (/classrooms/:id)
 * - Responsive y accesible
 * 
 * Flujo de usuario:
 * 1. Usuario con viewAny accede al listado
 * 2. Filtra por nombre si necesita
 * 3. Clic fila → detalle del ambiente
 * 4. Si tiene create → botón/formulario nuevo
 * 
 * @component
 * @returns {JSX.Element} Tabla responsive de ambientes con controles de acceso
 */
export default function ClassroomsListPage() {
  /**
   * Verificaciones de permisos Spatie.
   * Controlan visibilidad de acciones de creación.
   */
  const canCreate = can("classrooms.create");

  /**
   * Configuración dinámica del DataListLayout.
   * createPath=null oculta botón nativo si no tiene permiso.
   */
  const createPath = canCreate ? "/classrooms/create" : null;

  return (
    <DataListLayout
      title="Listado de Ambientes"
      endpoint="classrooms"
      createPath={createPath}
      initialFilters={{ per_page: 10 }}
      rowClickPath={(c) => `/classrooms/${c.id}`}

      filtersConfig={[
        /* Filtro principal: búsqueda por nombre de ambiente */
        {
          name: "classroom_name",
          label: "Nombre",
          placeholder: "Buscar por nombre de ambiente...",
          defaultValue: "",
          withSearchIcon: true,
        },
      ]}

      tableColumns={[
        /* Columna principal: nombre del ambiente */
        { key: "name", label: "Nombre" },

        /* Columna descriptiva (truncada si larga) */
        { 
          key: "description", 
          label: "Descripción",
          render: (c) => c.description || "Sin descripción",
        },
      ]}
    />
  );
}

// Componente principal de listado de datos
import DataListLayout from "../../components/DataList/DataListLayout";

// Utilidades de autenticación
import { can } from "../../utils/auth";

// Estilos del badge
import "../../components/Badge/Badge.css";

// Componente para badges compactos
import BadgesCompact from "../../components/BadgesCompact/BadgesCompact";

/**
 * Página de listado completo de áreas del sistema de formación.
 * 
 * Interfaz paginada con filtros y navegación protegida por permisos:
 * - areas.viewAny: acceso a la lista
 * - areas.create: botón "Crear Área" + ruta createPath
 * 
 * Características:
 * - Paginación (10 por página por defecto)
 * - Filtro por nombre (búsqueda en tiempo real)
 * - Columnas: nombre, descripción, conteo programas relacionados
 * - Navegación a detalle por doble clic en fila (/areas/:id)
 * - Responsive y accesible
 * 
 * Flujo de usuario:
 * 1. Usuario con viewAny accede al listado
 * 2. Filtra por nombre si necesita
 * 3. Clic fila → detalle del área
 * 4. Si tiene create → botón/formulario nuevo
 * 
 * Optimizaciones:
 * - createPath=null oculta botón nativo si no tiene permiso
 * - Filtros mínimos para performance
 * 
 * @component
 * @returns {JSX.Element} Tabla responsive de áreas con controles de acceso
 */
export default function AreasListPage() {
  /**
   * Verificaciones de permisos Spatie.
   * Controlan visibilidad de acciones de creación.
   */
  const canCreate = can("areas.create");

  /**
   * Configuración dinámica del DataListLayout.
   * 
   * createPath=null oculta botón nativo si no tiene permiso.
   */
  const createPath = canCreate ? "/areas/create" : null;

  return (
    <DataListLayout
      title="Listado de Áreas"
      endpoint="areas" // GET /api/areas con paginación/filtros
      createPath={createPath} // Dinámico por permiso
      initialFilters={{ per_page: 10 }} // Paginación por defecto
      rowClickPath={(a) => `/areas/${a.id}`} // Detalle por fila

      filtersConfig={[
        /* Filtro principal: búsqueda por nombre */
        {
          name: "area_name",
          label: "Nombre",
          placeholder: "Buscar por nombre de área...",
          defaultValue: "",
          withSearchIcon: true, // Icono visual de búsqueda
        },
      ]}

      tableColumns={[
        /* Columna principal: nombre del área */
        { key: "name", label: "Nombre" },

        /* Columna descriptiva (truncada si larga) */
        {
          key: "description",
          label: "Descripción",
          render: (a) => a.description || "Sin descripción", // Fallback visual
        },

        /* Columna métrica: conteo programas asociados */
        {
          key: "training_programs_count",
          label: "Programas",
          render: (a) => (
            <BadgesCompact
              items={[`${a.training_programs_count || 0}`]}
              maxVisible={1}
              badgeClassName="badge badge--blue"
              moreClassName="badge badge--fill-neutral"
            />
          ),
        },
      ]}
    />
  );
}

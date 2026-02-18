// Componente principal de listado de datos
import DataListLayout from "../../components/DataList/DataListLayout";

// Utilidades de autenticación
import { can } from "../../utils/auth";

/**
 * Página de listado completo de tipos de documento del sistema.
 *
 * Interfaz paginada con filtros y navegación protegida por permisos:
 * - document_types.viewAny: acceso a la lista
 * - document_types.create: botón "Crear Tipo de Documento" + ruta createPath
 *
 * Características:
 * - Paginación (10 por página por defecto)
 * - Filtro por nombre y sigla (búsqueda en tiempo real)
 * - Columnas: nombre, sigla
 * - Navegación a detalle por doble clic en fila (/document_types/:id)
 * - Responsive y accesible
 *
 * Flujo de usuario:
 * 1. Usuario con viewAny accede al listado
 * 2. Filtra por nombre o sigla si necesita
 * 3. Clic fila → detalle del tipo de documento
 * 4. Si tiene create → botón/formulario nuevo
 *
 * @component
 * @returns {JSX.Element} Tabla responsive de tipos de documento con controles de acceso
 */
export default function DocumentTypesListPage() {
  /**
   * Verificaciones de permisos Spatie.
   * Controlan visibilidad de acciones de creación.
   */
  const canCreate = can("document_types.create");

  /**
   * Configuración dinámica del DataListLayout.
   * createPath=null oculta botón nativo si no tiene permiso.
   */
  const createPath = canCreate ? "/document_types/create" : null;

  return (
    <DataListLayout
      title="Listado de Tipos de Documento"
      endpoint="document_types"
      createPath={createPath}
      initialFilters={{ per_page: 10 }}
      rowClickPath={(d) => `/document_types/${d.id}`}

      filtersConfig={[
        /* Filtro principal: búsqueda por nombre */
        {
          name: "name",
          label: "Nombre",
          placeholder: "Buscar por nombre...",
          defaultValue: "",
          withSearchIcon: true,
        },
        /* Filtro secundario: búsqueda por sigla (CC, TI, CE...) */
        {
          name: "acronym",
          label: "Sigla",
          placeholder: "Buscar por sigla...",
          defaultValue: "",
          withSearchIcon: true,
        },
      ]}

      tableColumns={[
        /* Columna principal: nombre completo del tipo de documento */
        { key: "name", label: "Nombre" },

        /* Columna de sigla */
        { key: "acronym", label: "Sigla" },
      ]}
    />
  );
}
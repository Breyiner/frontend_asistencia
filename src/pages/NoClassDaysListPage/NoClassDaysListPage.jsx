// Componente principal de layout de listas de datos
import DataListLayout from "../../components/DataList/DataListLayout";

// Estilos de badges (utilizados en celdas de tabla)
import "../../components/Badge/Badge.css";

// Hooks para catálogos dinámicos de filtros
import useCatalog from "../../hooks/useCatalog";

// Utilidades de autenticación y permisos
import { can } from "../../utils/auth";

/**
 * Página de listado de días sin clase.
 * 
 * Interfaz de tabla paginada con filtros avanzados para gestión
 * de días no lectivos. Utiliza componente genérico DataListLayout.
 * 
 * Características:
 * - Filtros primarios: fecha, ficha
 * - Filtros avanzados: motivo, programa, rango de fechas
 * - Columnas de tabla: fecha, motivo, ficha, programa, observaciones
 * - Navegación directa a detalle por fila
 * - Botón crear condicional por permisos
 * - Paginación automática (10 registros por página)
 * - Catálogos reactivos para selects de filtro
 * 
 * Flujo de filtros:
 * 1. Filtros básicos siempre visibles (fecha, ficha)
 * 2. Filtros avanzados colapsables (motivo, programa, rango fechas)
 * 3. Actualización automática de tabla al cambiar filtros
 * 4. Persistencia de filtros en URL via query params
 * 
 * Columnas mostradas:
 * - Fecha (ordenable)
 * - Motivo (reason_name)
 * - Ficha (ficha_number)
 * - Programa (training_program_name)
 * - Observaciones (truncadas)
 * 
 * @component
 * @returns {JSX.Element} Tabla paginada de días sin clase con filtros
 */
export default function NoClassDaysListPage() {
  // Permiso para mostrar botón de creación
  const canCreate = can("no_class_days.create");

  /**
   * Catálogos para opciones de filtros select.
   * 
   * Se cargan en paralelo y actualizan reactivamente:
   * - fichas: para filtro por ficha
   * - reasons: para filtro por motivo
   * - programs: para filtro por programa de formación
   */
  const fichasCatalog = useCatalog("fichas/select");
  const reasonsCatalog = useCatalog("no_class_reasons");
  const programsCatalog = useCatalog("training_programs/select");

  /**
   * Configuración completa de filtros de búsqueda.
   * 
   * Define:
   * - Campos primarios (siempre visibles)
   * - Campos avanzados (colapsables)
   * - Tipos de input (date, select)
   * - Opciones dinámicas para selects
   * - Valores por defecto vacíos
   */
  const filtersConfig = [
    {
      name: "date",
      label: "Fecha",
      type: "date",
      defaultValue: "",
    },
    {
      name: "ficha_id",
      label: "Ficha",
      type: "select",
      defaultValue: "",
      options: fichasCatalog.options,
      // advanced: true, // Comentado: filtro básico visible
    },
    {
      name: "reason_id",
      label: "Motivo",
      type: "select",
      defaultValue: "",
      options: reasonsCatalog.options,
      advanced: true, // Filtro avanzado colapsable
    },
    {
      name: "training_program_id",
      label: "Programa de Formación",
      type: "select",
      defaultValue: "",
      options: programsCatalog.options,
      advanced: true, // Filtro avanzado colapsable
    },
    {
      name: "date_from",
      label: "Desde",
      type: "date",
      defaultValue: "",
      advanced: true, // Parte de rango de fechas avanzado
    },
    {
      name: "date_to",
      label: "Hasta",
      type: "date",
      defaultValue: "",
      advanced: true, // Parte de rango de fechas avanzado
    },
  ];

  return (
    <DataListLayout
      title="Listado de Días sin Clase"
      endpoint="no_class_days"
      createPath={canCreate ? "/no_class_days/create" : null}
      initialFilters={{ per_page: 10 }}
      rowClickPath={(c) => `/no_class_days/${c.id}`}
      filtersConfig={filtersConfig}
      tableColumns={[
        { key: "date", label: "Fecha" },
        { key: "reason_name", label: "Motivo" },
        { key: "ficha_number", label: "Ficha" },
        { key: "training_program_name", label: "Programa" },
        { key: "observations", label: "Observaciones" },
      ]}
    />
  );
}

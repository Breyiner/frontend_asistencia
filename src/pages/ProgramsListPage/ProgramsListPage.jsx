// Componente genérico de layout de listas paginadas
import DataListLayout from "../../components/DataList/DataListLayout";

// Estilos de badges utilizados en renderizado de celdas
import "../../components/Badge/Badge.css";

// Componente auxiliar para badges compactos múltiples
import BadgesCompact from "../../components/BadgesCompact/BadgesCompact";

/**
 * Página de listado de programas de formación.
 * 
 * Interfaz de tabla paginada con filtros de texto para gestión
 * de programas de capacitación. Utiliza DataListLayout genérico.
 * 
 * Características:
 * - Filtros de texto: nombre, área, nivel de cualificación
 * - Paginación server-side (10 por página por defecto)
 * - Navegación directa a detalle por fila click
 * - Renderizado especial de badges para nivel
 * - Columna calculada fichas_count
 * - Botón crear siempre visible (sin verificación de permisos)
 * 
 * Filtros disponibles:
 * - program_name: búsqueda por nombre (con icono de lupa)
 * - area_name: filtrado por área temática
 * - qualification_level_name: filtrado por nivel
 * 
 * Columnas de tabla:
 * 1. Nombre (ordenable)
 * 2. Área
 * 3. Coordinador
 * 4. Fichas asociadas (conteo)
 * 5. Duración (meses)
 * 6. Nivel (renderizado como badge compacto)
 * 
 * Flujo:
 * 1. Carga inicial página 1 (10 registros)
 * 2. Filtros actualizan tabla reactivamente
 * 3. Click en fila → navegación a /training_programs/{id}
 * 4. Persistencia de filtros en query params de URL
 * 
 * @component
 * @returns {JSX.Element} Tabla paginada de programas con filtros de texto
 */
export default function ProgramsListPage() {
  return (
    <DataListLayout
      title="Listado de Programas de Formación"
      endpoint="training_programs"
      createPath="/training_programs/create"
      initialFilters={{ per_page: 10 }}
      rowClickPath={(p) => `/training_programs/${p.id}`}
      filtersConfig={[
        {
          name: "program_name",
          label: "Nombre",
          placeholder: "Nombre",
          defaultValue: "",
          withSearchIcon: true, // Icono de lupa visible
        },
        {
          name: "area_name",
          label: "Área",
          placeholder: "Área",
          defaultValue: "",
        },
        {
          name: "qualification_level_name",
          label: "Nivel",
          placeholder: "Nivel",
          defaultValue: "",
        },
      ]}
      tableColumns={[
        { key: "name", label: "Nombre" },
        { key: "area_name", label: "Área" },
        { key: "coordinator_name", label: "Coordinador/a" },
        { key: "fichas_count", label: "Fichas" },
        { key: "duration", label: "Duración" },
        {
          key: "qualification_level_name",
          label: "Nivel",
          render: (p) => (
            <BadgesCompact 
              items={[p.qualification_level_name]} 
              maxVisible={1} 
              badgeClassName="badge" 
            />
          ), // Renderizado especial como badge
        },
      ]}
    />
  );
}

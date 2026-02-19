// Componente genérico de layout de listas paginadas
import DataListLayout from "../../components/DataList/DataListLayout";

// Estilos de badges utilizados en renderizado de celdas
import "../../components/Badge/Badge.css";

// Componente auxiliar para badges compactos múltiples
import BadgesCompact from "../../components/BadgesCompact/BadgesCompact";

// Utilidades de autenticación y permisos ← AGREGADO
import { can } from "../../utils/auth";

/**
 * Página de listado de programas de formación.
 * 
 * Interfaz de tabla paginada con filtros de texto para gestión
 * de programas de capacitación. Utiliza DataListLayout genérico.
 * 
 * Características:
 * - Filtros de texto: nombre, área, nivel de cualificación
 * - Paginación server-side (10 por página por defecto)
 * - Navegación directa a detalle por fila click (SOLO con permisos)
 * - Renderizado especial de badges para nivel
 * - Columna calculada fichas_count
 * - Botón crear condicional ← NUEVO: Controlado por permisos
 * 
 * @component
 * @returns {JSX.Element} Tabla paginada de programas con filtros de texto
 */
export default function ProgramsListPage() {
  // ← NUEVO: Permisos usando solo `can()` utility
  const canCreate = can("training_programs.create");
  const canView = can("training_programs.show");

  return (
    <DataListLayout
      title="Listado de Programas de Formación"
      endpoint="training_programs"
      /* ← Botón crear SOLO si tiene permiso */
      createPath={canCreate ? "/training_programs/create" : null}
      initialFilters={{ per_page: 10 }}
      /* ← Navegación a detalle SOLO si tiene permiso */
      rowClickPath={canView ? (p) => `/training_programs/${p.id}` : null}
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

// Componente principal de listado de datos
import DataListLayout from "../../components/DataList/DataListLayout";

// Estilos del badge
import "../../components/Badge/Badge.css";

// Componente para badges compactos
import BadgesCompact from "../../components/BadgesCompact/BadgesCompact";

/**
 * Componente para listar todas las áreas del sistema.
 * 
 * Utiliza DataListLayout genérico con configuración específica para áreas.
 * 
 * Características:
 * - Tabla paginada con 10 elementos por página
 * - Filtro por nombre (búsqueda en tiempo real)
 * - Columnas: nombre, descripción, programas relacionados
 * - Navegación a detalle por clic en fila
 * - Botón crear nueva área integrado
 * 
 * Flujo:
 * 1. Carga datos desde endpoint "areas"
 * 2. Usuario puede filtrar por nombre
 * 3. Clic en fila navega a /areas/{id}
 * 4. Botón crear lleva a formulario
 * 
 * @component
 * @returns {JSX.Element} Tabla completa de áreas con filtros y navegación
 */
export default function AreasListPage() {
  return (
    <DataListLayout
      title="Listado de Áreas"
      endpoint="areas" // Endpoint del backend para áreas
      createPath="/areas/create" // Ruta para crear nueva área
      initialFilters={{ per_page: 10 }} // Paginación inicial
      rowClickPath={(a) => `/areas/${a.id}`} // Navegación a detalle por fila
      filtersConfig={[
        /* Filtro principal por nombre de área */
        {
          name: "area_name",
          label: "Nombre",
          placeholder: "Nombre",
          defaultValue: "",
          withSearchIcon: true, // Icono de lupa en campo
        }
      ]}
      tableColumns={[
        /* Columna nombre del área */
        { key: "name", label: "Nombre" },
        
        /* Columna descripción */
        { key: "description", label: "Descripción" },
        
        /* Columna conteo de programas relacionados */
        { key: "training_programs_count", label: "Programas Relacionados" }
      ]}
    />
  );
}

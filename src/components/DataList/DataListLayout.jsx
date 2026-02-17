// Importa useNavigate de react-router-dom para navegación programática
import { useNavigate } from "react-router-dom";

// Importa useEffect para ejecutar efectos secundarios
import { useEffect } from "react";

// Importa componentes reutilizables
import Button from "../Button/Button";
import ListFilters from "../ListFilters/ListFilters";
import DataTable from "../DataTable/DataTable";
import Paginator from "../Paginator/Paginator";

// Importa hook personalizado para manejar lógica de listas de datos
import useDataList from "../../hooks/useDataList";

// Importa icono de "agregar" de Remix Icon
import { RiAddLine } from "@remixicon/react";

// Importa estilos del layout de lista de datos
import "./DataList.css";

/**
 * Componente de layout reutilizable para páginas de listado de datos.
 * 
 * Proporciona una estructura completa para páginas CRUD de listado que incluye:
 * - Header con título y botón de crear
 * - Filtros personalizables
 * - Tabla de datos con columnas configurables
 * - Paginación
 * - Navegación al hacer click en filas
 * - Acciones personalizadas adicionales
 * 
 * Este componente abstrae toda la lógica común de las páginas de listado,
 * permitiendo crear nuevas páginas de listado solo configurando props.
 * 
 * Casos de uso:
 * - Lista de aprendices
 * - Lista de instructores
 * - Lista de fichas
 * - Lista de programas
 * - Cualquier entidad que requiera listado con filtros y paginación
 * 
 * @component
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.title - Título de la página (ej: "Aprendices")
 * @param {string} props.endpoint - Endpoint de la API para obtener datos (ej: "apprentices")
 * @param {string} [props.createPath] - Ruta para crear nuevo registro (botón "Nuevo")
 * @param {Array} [props.filtersConfig] - Configuración de filtros (pasada a ListFilters)
 * @param {Array} props.tableColumns - Configuración de columnas de la tabla
 * @param {Object} [props.initialFilters] - Filtros iniciales (page, per_page, etc.)
 * @param {Function} [props.rowClickPath] - Función que retorna ruta al hacer click en fila
 * @param {React.ReactNode} [props.customActions] - Acciones personalizadas en el header
 * @param {Function} [props.onRefetchReady] - Callback que recibe función refetch
 * 
 * @returns {JSX.Element} Layout completo de página de listado
 * 
 * @example
 * // Página de lista de aprendices
 * <DataListLayout
 *   title="Aprendices"
 *   endpoint="apprentices"
 *   createPath="/apprentices/create"
 *   filtersConfig={[
 *     { type: "text", name: "search", label: "Buscar", placeholder: "Nombre o documento..." }
 *   ]}
 *   tableColumns={[
 *     { key: "full_name", label: "Nombre Completo" },
 *     { key: "document_number", label: "Documento" },
 *     { key: "email", label: "Email" }
 *   ]}
 *   initialFilters={{ page: 1, per_page: 10 }}
 *   rowClickPath={(row) => `/apprentices/${row.id}`}
 * />
 * 
 * @example
 * // Con acciones personalizadas
 * <DataListLayout
 *   title="Instructores"
 *   endpoint="instructors"
 *   createPath="/instructors/create"
 *   tableColumns={columns}
 *   customActions={
 *     <Button onClick={handleExport}>
 *       <RiDownloadLine size={18} />
 *       Exportar
 *     </Button>
 *   }
 *   onRefetchReady={(refetch) => setRefetchFunction(refetch)}
 * />
 */
export default function DataListLayout({
  title,
  endpoint,
  createPath,
  filtersConfig,
  tableColumns,
  initialFilters,
  rowClickPath,
  customActions,
  onRefetchReady,
}) {
  
  // Hook de navegación de react-router-dom
  const navigate = useNavigate();
  
  // Hook personalizado que maneja la lógica de obtención de datos
  // Proporciona: data (array de registros), loading, total, filters, setFilters, refetch
  const { data, loading, total, filters, setFilters, refetch } = useDataList({
    endpoint,
    initialFilters,
  });

  // Efecto para proporcionar la función refetch al componente padre
  // Permite que el padre pueda recargar los datos cuando sea necesario
  useEffect(() => {
    if (onRefetchReady) {
      onRefetchReady(refetch);
    }
  }, [onRefetchReady, refetch]);

  /**
   * Maneja el click en el botón "Nuevo".
   * 
   * Navega a la ruta de creación si está definida.
   * 
   * @function
   */
  const handleCreate = () => {
    if (createPath) navigate(createPath);
  };

  /**
   * Maneja cambios en los filtros.
   * 
   * Resetea la página a 1 y aplica los nuevos filtros.
   * Esto asegura que siempre se muestre la primera página
   * después de cambiar un filtro.
   * 
   * @param {Object} newFilters - Nuevos valores de filtros
   */
  const handleFiltersChange = (newFilters) => {
    setFilters({
      page: 1,        // Resetea a la primera página
      per_page: 10,   // Mantiene tamaño de página por defecto
      ...newFilters,  // Aplica los nuevos filtros
    });
  };

  /**
   * Maneja cambios de página en el paginador.
   * 
   * Actualiza solo el número de página manteniendo
   * los demás filtros intactos.
   * 
   * @param {number} page - Número de página nueva
   */
  const handlePageChange = (page) => {
    setFilters((prevFilters) => ({
      ...prevFilters, // Mantiene filtros anteriores
      page,           // Solo actualiza la página
    }));
  };

  /**
   * Función para manejar click en filas de la tabla.
   * 
   * Solo se define si rowClickPath está presente.
   * Navega a la ruta generada por rowClickPath(row).
   */
  const handleRowClick = rowClickPath
    ? (row) => navigate(rowClickPath(row))
    : undefined; // Si no hay rowClickPath, las filas no son clickeables

  return (
    // Contenedor principal de la página de listado
    <div className="data-list-page">
      
      {/* Header de la página con título y acciones */}
      <header className="data-list-page__header">
        {/* Título principal de la página */}
        <h1 className="data-list-page__title">{title}</h1>
        
        {/* Contenedor de acciones del header */}
        <div className="data-list-page__actions">
          {/* Renderiza acciones personalizadas si existen */}
          {customActions}
          
          {/* Botón "Nuevo" - solo se muestra si createPath está definido
              Renderizado condicional con && */}
          {createPath && (
            <Button variant="primary" onClick={handleCreate}>
              <RiAddLine size={18} />
              Nuevo
            </Button>
          )}
        </div>
      </header>

      {/* Componente de filtros - solo se muestra si hay configuración de filtros
          Renderizado condicional verificando longitud del array */}
      {filtersConfig?.length > 0 && (
        <ListFilters config={filtersConfig} onChange={handleFiltersChange} />
      )}

      {/* Tabla de datos con las columnas configuradas
          - data: array de registros a mostrar
          - columns: configuración de columnas
          - loading: estado de carga
          - onRowClick: función para navegar al hacer click (opcional) */}
      <DataTable
        data={data}
        columns={tableColumns}
        loading={loading}
        onRowClick={handleRowClick}
      />

      {/* Paginador para navegar entre páginas
          - page: página actual
          - total: total de registros
          - perPage: registros por página
          - onPageChange: callback al cambiar de página */}
      <Paginator
        page={filters.page}
        total={total}
        perPage={filters.per_page}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
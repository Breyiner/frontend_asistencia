// Importa componente Button
import Button from "../Button/Button";

// Importa iconos de flechas de Remix Icon
import {
  RiArrowLeftSLine,   // Flecha izquierda
  RiArrowRightSLine,  // Flecha derecha
} from "@remixicon/react";

// Importa estilos del paginador
import "./Paginator.css";

/**
 * Componente de paginación para navegar entre páginas de datos.
 * 
 * Características:
 * - Botones de "Anterior" y "Siguiente" con iconos
 * - Botones numerados para cada página
 * - Página actual resaltada visualmente
 * - Botones deshabilitados cuando no hay más páginas
 * - Se oculta automáticamente si solo hay 1 página
 * 
 * Cálculo automático de:
 * - Total de páginas basado en total de registros y registros por página
 * - Estado de habilitación de botones Anterior/Siguiente
 * 
 * @component
 * 
 * @param {Object} props - Propiedades del componente
 * @param {number} props.page - Página actual (1-indexed)
 * @param {number} props.total - Total de registros
 * @param {number} props.perPage - Registros por página
 * @param {Function} props.onPageChange - Callback ejecutado al cambiar de página
 * 
 * @returns {JSX.Element|null} Paginador o null si hay 1 o menos páginas
 * 
 * @example
 * <Paginator
 *   page={currentPage}
 *   total={150}
 *   perPage={10}
 *   onPageChange={(page) => setCurrentPage(page)}
 * />
 * // Con 150 registros y 10 por página, muestra 15 páginas
 * 
 * @example
 * // Con pocos datos (1 página o menos), no renderiza nada
 * <Paginator
 *   page={1}
 *   total={5}
 *   perPage={10}
 *   onPageChange={handlePageChange}
 * />
 * // No renderiza nada (total/perPage = 0.5 páginas)
 */
export default function Paginator({ page, total, perPage, onPageChange }) {
  
  // Calcula el total de páginas
  // Math.ceil redondea hacia arriba (10.1 → 11)
  // Math.max asegura mínimo de 1 página
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  
  // Si hay 1 o menos páginas, no muestra el paginador
  if (totalPages <= 1) return null;

  // Determina si se puede ir a la página anterior
  const canPrev = page > 1;
  
  // Determina si se puede ir a la página siguiente
  const canNext = page < totalPages;

  /**
   * Maneja el click en un botón de página numerado.
   * 
   * Solo ejecuta el cambio si la página clickeada es diferente a la actual.
   * 
   * @param {number} p - Número de página clickeada
   */
  const handlePageClick = (p) => {
    // Si ya está en esa página, no hace nada
    if (p === page) return;
    
    // Ejecuta callback con el número de página
    onPageChange(p);
  };

  return (
    // Contenedor principal del paginador
    <div className="data-paginator">
      
      {/* Botón "Anterior" */}
      <Button
        variant="outline"
        size="sm"
        disabled={!canPrev} // Deshabilitado si no puede retroceder
        // Solo ejecuta si puede retroceder (doble verificación)
        onClick={() => canPrev && onPageChange(page - 1)}
      >
        <RiArrowLeftSLine size={16} />
        Anterior
      </Button>

      {/* Contenedor de botones numerados de páginas */}
      <div className="data-paginator__pages">
        {/* Genera array de números de 1 a totalPages
            Array.from({ length: N }) crea array de N elementos
            (_, i) => i + 1 mapea índices 0,1,2... a números 1,2,3... */}
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <Button
            key={p}
            type="button"
            // Clase dinámica: agrega --active si es la página actual
            className={`data-paginator__page ${
              p === page ? "data-paginator__page--active" : ""
            }`}
            onClick={() => handlePageClick(p)}
          >
            {p}
          </Button>
        ))}
      </div>

      {/* Botón "Siguiente" */}
      <Button
        variant="outline"
        size="sm"
        disabled={!canNext} // Deshabilitado si no puede avanzar
        // Solo ejecuta si puede avanzar (doble verificación)
        onClick={() => canNext && onPageChange(page + 1)}
      >
        Siguiente
        <RiArrowRightSLine size={16} />
      </Button>
    </div>
  );
}
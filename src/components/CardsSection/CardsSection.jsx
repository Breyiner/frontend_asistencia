// Importa Link de react-router-dom para navegación SPA
import { Link } from "react-router-dom";

// Importa los estilos específicos de la sección de tarjetas
import "./CardsSection.css";

/**
 * Componente de sección para mostrar una colección de tarjetas con header y acciones.
 * 
 * Proporciona una estructura consistente para secciones que contienen:
 * - Header con título y enlace de acción (ej: "+ Asociar", "+ Agregar")
 * - Grid/lista de items renderizados mediante función personalizada
 * - Mensaje de estado vacío cuando no hay items
 * 
 * Es útil para secciones como:
 * - "Fichas Asociadas" con botón "+ Asociar Ficha"
 * - "Instructores Asignados" con botón "+ Asignar Instructor"
 * - "Documentos" con botón "+ Subir Documento"
 * 
 * @component
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.title - Título de la sección (ej: "Fichas Asociadas")
 * @param {string} [props.actionTo] - Ruta de destino para el enlace de acción (opcional)
 * @param {string} [props.actionLabel="+ Asociar"] - Texto del enlace de acción
 * @param {string} [props.emptyText="No hay registros"] - Mensaje cuando no hay items
 * @param {string} [props.emptyActionLabel] - Texto alternativo para acción cuando está vacío (no usado actualmente)
 * @param {Array} [props.items=[]] - Array de items a renderizar
 * @param {Function} props.renderItem - Función que renderiza cada item (recibe item, retorna JSX)
 * 
 * @returns {JSX.Element} Sección con header, contenido y estado vacío
 * 
 * @example
 * // Sección de fichas asociadas
 * <CardsSection
 *   title="Fichas Asociadas"
 *   actionTo="/programs/123/associate-ficha"
 *   actionLabel="+ Asociar Ficha"
 *   emptyText="No hay fichas asociadas"
 *   items={fichas}
 *   renderItem={(ficha) => (
 *     <FichaCard key={ficha.id} ficha={ficha} />
 *   )}
 * />
 * 
 * @example
 * // Sección sin enlace de acción
 * <CardsSection
 *   title="Historial de Cambios"
 *   emptyText="No hay cambios registrados"
 *   items={changes}
 *   renderItem={(change) => (
 *     <ChangeCard key={change.id} change={change} />
 *   )}
 * />
 */
export default function CardsSection({
  title,
  actionTo,
  actionLabel = "+ Asociar",
  emptyText = "No hay registros",
  emptyActionLabel, // Prop declarada pero no utilizada actualmente
  items = [],
  renderItem,
}) {
  return (
    // Contenedor principal de la sección
    <div className="cards-section">
      
      {/* Header de la sección con título y enlace de acción */}
      <div className="cards-section__header">
        {/* Título de la sección */}
        <h3 className="cards-section__title">{title}</h3>

        {/* Enlace de acción - solo se renderiza si actionTo está definido
            Renderizado condicional con operador ternario */}
        {actionTo ? (
          <Link className="link-btn link-btn--primary link-btn--sm" to={actionTo}>
            {actionLabel}
          </Link>
        ) : null}
      </div>

      {/* Contenedor del contenido - renderiza todos los items */}
      <div className="cards-section__content">
        {/* Mapea cada item usando la función renderItem personalizada
            renderItem debe retornar JSX con key único para cada item */}
        {items.map(renderItem)}
      </div>

      {/* Mensaje de estado vacío - solo se muestra si no hay items
          Renderizado condicional verificando longitud del array */}
      {items.length === 0 ? (
        <div className="cards-section__empty">
          <p>{emptyText}</p>
        </div>
      ) : null}
    </div>
  );
}
// Link SPA
import { Link } from "react-router-dom";

// Estilos
import "./CardsSection.css";

/**
 * Sección reusable para renderizar un conjunto de cards con header + acción.
 *
 * Requisito UX:
 * - Cuando `disabled` es true:
 *   - se bloquea interacción de toda la sección (cards y header)
 *   - se muestra overlay
 *   - el Link se “deshabilita” con preventDefault + aria-disabled + tabIndex
 *
 * Nota: CSS `pointer-events: none` en un contenedor también bloquea sus hijos [web:164].
 *
 * @param {Object} props
 * @param {string} props.title
 * @param {string} [props.actionTo]
 * @param {string} [props.actionLabel]
 * @param {string} [props.emptyText]
 * @param {string} [props.emptyActionLabel]
 * @param {Array<any>} [props.items]
 * @param {(item:any)=>JSX.Element} props.renderItem
 * @param {boolean} [props.disabled]
 * @param {string} [props.disabledText]
 * @returns {JSX.Element}
 */
export default function CardsSection({
  // Título de la sección
  title,
  // Ruta de Link de acción
  actionTo,
  // Texto del Link
  actionLabel = "+ Asociar",
  // Texto cuando no hay items
  emptyText = "No hay registros",
  // Prop declarada (no usada por tu UI actual)
  emptyActionLabel,
  // Items a renderizar
  items = [],
  // Render function
  renderItem,

  // Bloqueo global
  disabled = false,
  // Texto del overlay
  disabledText = "Procesando...",
}) {
  return (
    // Contenedor principal; clase extra cuando está deshabilitado
    <div className={`cards-section ${disabled ? "cards-section--disabled" : ""}`}>
      {/* Header con título + acción */}
      <div className="cards-section__header">
        {/* Título */}
        <h3 className="cards-section__title">{title}</h3>

        {/* Link acción (solo si actionTo existe) */}
        {actionTo ? (
          <Link
            // Clase extra para estilos
            className={`link-btn link-btn--primary link-btn--sm ${disabled ? "is-disabled" : ""}`}
            // Si está disabled, evita navegar
            to={disabled ? "#" : actionTo}
            // Bloqueo por JS para Link (además del pointer-events) [web:170]
            onClick={(e) => {
              // Si está bloqueado: no hace navegación
              if (disabled) e.preventDefault();
            }}
            // A11y: comunica estado deshabilitado a lectores de pantalla [web:170]
            aria-disabled={disabled}
            // Evita tab focus cuando está deshabilitado (navegación por teclado)
            tabIndex={disabled ? -1 : 0}
          >
            {/* Texto */}
            {actionLabel}
          </Link>
        ) : null}
      </div>

      {/* Contenido: grid/lista de cards */}
      <div className="cards-section__content">
        {/* Renderiza cada item */}
        {items.map(renderItem)}
      </div>

      {/* Estado vacío */}
      {items.length === 0 ? (
        <div className="cards-section__empty">
          {/* Texto */}
          <p>{emptyText}</p>
        </div>
      ) : null}

      {/* Overlay cuando está disabled */}
      {disabled ? (
        <div className="cards-section__overlay">
          {/* Texto de overlay */}
          {disabledText}
        </div>
      ) : null}
    </div>
  );
}

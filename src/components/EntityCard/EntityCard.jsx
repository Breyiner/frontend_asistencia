// Importa estilos de la tarjeta de entidad
import "./EntityCard.css";

// Importa estilos compartidos de badges
import "../../components/Badge/Badge.css";

// Importa componente para mostrar badges de forma compacta
import BadgesCompact from "../BadgesCompact/BadgesCompact";

/**
 * Componente de tarjeta para mostrar entidades con badges y acciones.
 * 
 * Diseñado para mostrar información de entidades relacionales como:
 * - Fichas asociadas a un programa
 * - Instructores asignados a una ficha
 * - Programas de un aprendiz
 * - Cualquier entidad que tenga relación con otra
 * 
 * Características:
 * - Header con título, badges y badge de estado activo
 * - Badges compactos con overflow (+N)
 * - Badge especial para marcar entidad como "Actual/Activa"
 * - Contenedor de acciones (botones, enlaces, etc.)
 * - Cuerpo para contenido adicional (children)
 * - Estilo especial cuando está marcada como activa
 * 
 * @component
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.title - Título principal de la tarjeta
 * @param {Array<Object>} [props.badges=[]] - Array de badges a mostrar
 * @param {string} props.badges[].text - Texto del badge
 * @param {boolean} [props.isActive=false] - Indica si la entidad está activa/actual
 * @param {string} [props.activeBadgeText="Actual"] - Texto del badge cuando está activa
 * @param {Array<React.ReactNode>} [props.actions=[]] - Array de elementos de acción (botones)
 * @param {string} [props.className=""] - Clases CSS adicionales
 * @param {React.ReactNode} props.children - Contenido del cuerpo de la tarjeta
 * 
 * @returns {JSX.Element} Tarjeta de entidad con header y cuerpo
 * 
 * @example
 * // Ficha activa con badges y acciones
 * <EntityCard
 *   title="Ficha 2558971"
 *   badges={[
 *     { text: "ADSI" },
 *     { text: "Bogotá" }
 *   ]}
 *   isActive={true}
 *   activeBadgeText="Ficha Actual"
 *   actions={[
 *     <Button key="edit" onClick={handleEdit}>Editar</Button>,
 *     <Button key="remove" onClick={handleRemove}>Remover</Button>
 *   ]}
 * >
 *   <p>Fecha inicio: 01/01/2024</p>
 *   <p>Instructor: Juan Pérez</p>
 * </EntityCard>
 * 
 * @example
 * // Tarjeta simple sin estado activo
 * <EntityCard
 *   title="Programa ADSI"
 *   badges={[
 *     { text: "Tecnología" },
 *     { text: "2 años" }
 *   ]}
 * >
 *   <p>Descripción del programa...</p>
 * </EntityCard>
 */
export default function EntityCard({
  title,
  badges = [],
  isActive = false,
  activeBadgeText = "Actual",
  actions = [],
  className = "",
  children,
}) {
  return (
    // Contenedor principal de la tarjeta
    // Clases dinámicas: agrega --active si isActive es true
    <div className={`entity-card ${isActive ? "entity-card--active" : ""} ${className}`}>
      
      {/* Header de la tarjeta */}
      <div className="entity-card__header">
        
        {/* Fila del título con badges */}
        <div className="entity-card__title-row">
          
          {/* Título principal (h4 para jerarquía semántica) */}
          <h4 className="entity-card__title">{title}</h4>

          {/* Badges compactos de información
              Extrae solo el texto de cada badge del array
              maxVisible={2}: muestra máximo 2 badges, el resto como "+N" */}
          <BadgesCompact
            items={badges.map((b) => b.text)}
            maxVisible={2}
            badgeClassName="badge badge--purple"
            moreClassName="badge badge--fill-neutral"
          />

          {/* Badge de estado "Actual/Activa" - solo si isActive es true
              Renderizado condicional con operador ternario */}
          {isActive ? (
            <BadgesCompact
              items={[activeBadgeText]}
              maxVisible={1}
              badgeClassName="badge badge--fill-success" // Verde para indicar activo
            />
          ) : null}

        </div>

        {/* Contenedor de acciones (botones, enlaces, etc.)
            Renderiza el array de acciones directamente */}
        <div className="entity-card__actions">{actions}</div>
      </div>

      {/* Cuerpo de la tarjeta donde se renderiza el contenido (children) */}
      <div className="entity-card__body">{children}</div>
    </div>
  );
}
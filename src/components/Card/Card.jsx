// Importa los estilos específicos del componente Card
import "./Card.css";

/**
 * Componente de tarjeta (Card) reutilizable con título opcional y variantes de estilo.
 * 
 * Proporciona un contenedor visual estructurado con:
 * - Título opcional (h3)
 * - Cuerpo para contenido (children)
 * - Variantes de estilo predefinidas
 * - Clases CSS personalizables
 * 
 * Las variantes controlan el estilo visual de toda la tarjeta
 * (bordes, sombras, colores de fondo, etc.)
 * 
 * Variantes disponibles (definidas en Card.css):
 * - default: Estilo por defecto
 * - info: Estilo informativo
 * - warning: Estilo de advertencia
 * - danger: Estilo de peligro/error
 * - success: Estilo de éxito
 * - etc. (según las clases definidas en Card.css)
 * 
 * @component
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} [props.title] - Título opcional de la tarjeta (se muestra en h3)
 * @param {string} [props.variant="default"] - Variante de estilo de la tarjeta
 * @param {string} [props.className=""] - Clases CSS adicionales personalizadas
 * @param {React.ReactNode} props.children - Contenido del cuerpo de la tarjeta
 * 
 * @returns {JSX.Element} Div con estructura de tarjeta
 * 
 * @example
 * // Tarjeta simple sin título
 * <Card>
 *   <p>Contenido de la tarjeta</p>
 * </Card>
 * 
 * @example
 * // Tarjeta con título
 * <Card title="Información del Usuario">
 *   <UserInfo />
 * </Card>
 * 
 * @example
 * // Tarjeta de advertencia con clase personalizada
 * <Card 
 *   title="Advertencia" 
 *   variant="warning"
 *   className="my-custom-class"
 * >
 *   <p>Mensaje de advertencia importante</p>
 * </Card>
 * 
 * @example
 * // Tarjeta de éxito
 * <Card title="Operación Exitosa" variant="success">
 *   <p>Los datos se guardaron correctamente</p>
 * </Card>
 */
export default function Card({ title, variant = "default", className = "", children }) {
  return (
    // Contenedor principal con clases dinámicas
    // Combina: clase base + variante + clases personalizadas
    <div className={`card card--${variant} ${className}`}>
      
      {/* Título de la tarjeta - solo se renderiza si existe
          Renderizado condicional con operador ternario
          El título también usa la variante para estilos específicos */}
      {title ? <h3 className={`card__title card__title--${variant}`}>{title}</h3> : null}
      
      {/* Cuerpo de la tarjeta donde se renderiza el contenido (children)
          También aplica clases con la variante para estilos específicos */}
      <div className={`card__body card__body--${variant}`}>{children}</div>
    </div>
  );
}
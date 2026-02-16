// Importa estilos del botón de acción con icono
import "./IconActionButton.css";

/**
 * Componente de botón de acción con icono.
 * 
 * Botón pequeño y minimalista diseñado para acciones rápidas,
 * típicamente usado en:
 * - Filas de tablas (editar, eliminar, ver detalles)
 * - Tarjetas de entidades (acciones rápidas)
 * - Barras de herramientas compactas
 * 
 * Características:
 * - Diseño minimalista (solo icono, sin texto visible)
 * - Tooltip mediante atributo title
 * - Accesibilidad con aria-label
 * - Color personalizable
 * - Acepta cualquier contenido como children (típicamente iconos)
 * - Soporta todas las props nativas de button
 * 
 * @component
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.title - Texto del tooltip y aria-label (accesibilidad)
 * @param {Function} props.onClick - Callback ejecutado al hacer click
 * @param {string} [props.color] - Color personalizado del icono (CSS color)
 * @param {React.ReactNode} props.children - Contenido del botón (típicamente un icono)
 * @param {string} [props.className=""] - Clases CSS adicionales
 * @param {Object} props...props - Demás props nativas de button (disabled, type, etc.)
 * 
 * @returns {JSX.Element} Botón con icono
 * 
 * @example
 * // Botón de editar
 * <IconActionButton
 *   title="Editar"
 *   onClick={handleEdit}
 * >
 *   <RiEditLine size={18} />
 * </IconActionButton>
 * 
 * @example
 * // Botón de eliminar con color personalizado
 * <IconActionButton
 *   title="Eliminar"
 *   onClick={handleDelete}
 *   color="#dc3545"
 * >
 *   <RiDeleteBinLine size={18} />
 * </IconActionButton>
 * 
 * @example
 * // Botón deshabilitado
 * <IconActionButton
 *   title="Ver detalles"
 *   onClick={handleView}
 *   disabled={!hasPermission}
 * >
 *   <RiEyeLine size={18} />
 * </IconActionButton>
 * 
 * @example
 * // Uso en fila de tabla
 * <td className="actions-cell">
 *   <IconActionButton title="Editar" onClick={() => handleEdit(row.id)}>
 *     <RiEditLine size={18} />
 *   </IconActionButton>
 *   <IconActionButton title="Eliminar" onClick={() => handleDelete(row.id)} color="#dc3545">
 *     <RiDeleteBinLine size={18} />
 *   </IconActionButton>
 * </td>
 */
export default function IconActionButton({ title, onClick, color, children, className = "", ...props}) {
  return (
    // Botón con tipo "button" para prevenir submit en formularios
    <button
      type="button"
      className={`icon-action-btn ${className}`}
      onClick={onClick}
      // title: muestra tooltip al hacer hover
      title={title}
      // aria-label: proporciona etiqueta accesible para lectores de pantalla
      // (importante porque el botón solo tiene icono, sin texto visible)
      aria-label={title}
      // style inline: aplica color personalizado si se proporciona
      // Si color es undefined, style será undefined (no se aplica)
      style={color ? { color } : undefined}
      // ...props: pasa todas las demás props (disabled, data-*, etc.)
      {...props}
    >
      {/* Renderiza el contenido (típicamente un componente de icono) */}
      {children}
    </button>
  );
}
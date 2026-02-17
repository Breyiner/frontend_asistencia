// Importa los estilos específicos del componente Button
import "./Button.css";

/**
 * Componente de botón reutilizable con variantes de estilo.
 * 
 * Proporciona un botón HTML <button> con estilos predefinidos
 * según la variante especificada. Soporta todas las props
 * nativas de HTML button mediante el spread operator.
 * 
 * Variantes disponibles (definidas en CSS):
 * - primary: Botón principal (acción primaria)
 * - secondary: Botón secundario (acción secundaria)
 * - danger: Botón de peligro (acciones destructivas)
 * - success: Botón de éxito
 * - etc. (según las clases definidas en Button.css)
 * 
 * @component
 * 
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Contenido del botón (texto, iconos, etc.)
 * @param {string} [props.variant="primary"] - Variante de estilo del botón
 * @param {Object} props...props - Todas las demás props HTML de button (onClick, disabled, type, etc.)
 * 
 * @returns {JSX.Element} Elemento button con estilos aplicados
 * 
 * @example
 * // Botón primario simple
 * <Button variant="primary" onClick={handleSave}>
 *   Guardar
 * </Button>
 * 
 * @example
 * // Botón secundario con icono
 * <Button variant="secondary" onClick={handleCancel}>
 *   <RiCloseLine size={18} />
 *   Cancelar
 * </Button>
 * 
 * @example
 * // Botón deshabilitado durante carga
 * <Button variant="primary" disabled={loading}>
 *   {loading ? "Guardando..." : "Guardar"}
 * </Button>
 * 
 * @example
 * // Botón de peligro para acción destructiva
 * <Button variant="danger" onClick={handleDelete}>
 *   Eliminar
 * </Button>
 */
export default function Button({ children, variant = "primary", ...props }) {
  return (
    // Botón HTML con clases CSS dinámicas
    // La clase base es "btn" y la variante se agrega con "btn--{variant}"
    // ...props pasa todas las demás props (onClick, disabled, type, etc.)
    <button className={`btn btn--${variant}`} {...props}>
      {/* Renderiza el contenido del botón (texto, iconos, etc.) */}
      {children}
    </button>
  );
}
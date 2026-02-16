// Importa estilos del componente de fila de información
import "./InfoRow.css";

/**
 * Componente simple para mostrar información en formato clave-valor.
 * 
 * Renderiza una fila con etiqueta (label) y valor (value) en un layout
 * horizontal consistente. Es útil para mostrar detalles de entidades
 * de forma estructurada.
 * 
 * Soporta variantes de estilo mediante la prop variant.
 * Muestra "—" (guión em) cuando el valor es null/undefined.
 * 
 * Casos de uso típicos:
 * - Detalles de usuario (Nombre: Juan Pérez)
 * - Información de entidades (Desde: 01/01/2024)
 * - Datos de configuración (Estado: Activo)
 * 
 * @component
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.label - Etiqueta/nombre del campo (ej: "Nombre", "Email")
 * @param {*} props.value - Valor a mostrar (cualquier tipo)
 * @param {string} [props.variant=""] - Variante de estilo (afecta clases CSS)
 * 
 * @returns {JSX.Element} Div con etiqueta y valor
 * 
 * @example
 * // Fila simple
 * <InfoRow label="Nombre" value="Juan Pérez" />
 * // Renderiza: Nombre: Juan Pérez
 * 
 * @example
 * // Con valor null (muestra guión)
 * <InfoRow label="Teléfono" value={null} />
 * // Renderiza: Teléfono: —
 * 
 * @example
 * // Con variante
 * <InfoRow label="Estado" value="Activo" variant="success" />
 * 
 * @example
 * // Uso típico en tarjeta de detalles
 * <Card title="Información Personal">
 *   <InfoRow label="Nombre completo" value={user.full_name} />
 *   <InfoRow label="Email" value={user.email} />
 *   <InfoRow label="Teléfono" value={user.phone} />
 *   <InfoRow label="Documento" value={user.document} />
 * </Card>
 */
export default function InfoRow({ label, value, variant = "" }) {
  return (
    // Contenedor principal con clase dinámica
    // Si variant existe, usa clase con modificador (info-row--{variant})
    // Si no, usa clase base (info-row)
    <div className={variant ? `info-row--${variant}` : "info-row"}>
      
      {/* Etiqueta del campo con dos puntos
          Ej: "Nombre:", "Email:", "Estado:" */}
      <div className="info-row__label">{label}:</div>
      
      {/* Valor del campo
          Usa nullish coalescing (??):
          - Si value es null o undefined, muestra "—" (guión em)
          - Si no, muestra el valor tal cual */}
      <div className="info-row__value">{value ?? "-"}</div>
    </div>
  );
}
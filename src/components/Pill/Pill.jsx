// Importa React (necesario para JSX)
import React from "react";

// Importa estilos del componente Pill
import "./Pill.css";

/**
 * Componente de etiqueta pequeña (pill/badge) para mostrar estados o valores.
 * 
 * Renderiza una pequeña etiqueta redondeada con color según la variante.
 * Es útil para mostrar:
 * - Estados (Activo, Inactivo, Pendiente)
 * - Alertas (Alta, Media, Baja)
 * - Categorías
 * - Números con énfasis
 * 
 * Variantes disponibles:
 * - "danger": Rojo - para peligro, error, crítico
 * - "warning": Amarillo/naranja - para advertencias
 * - "neutral": Gris - para información neutral
 * 
 * @component
 * 
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Contenido de la etiqueta (texto, número, etc.)
 * @param {string} [props.variant="danger"] - Variante de color ("danger", "warning", "neutral")
 * 
 * @returns {JSX.Element} Span con estilo de pill
 * 
 * @example
 * // Pill de peligro (rojo) - por defecto
 * <Pill variant="danger">Crítico</Pill>
 * 
 * @example
 * // Pill de advertencia (amarillo)
 * <Pill variant="warning">5 ausencias</Pill>
 * 
 * @example
 * // Pill neutral (gris)
 * <Pill variant="neutral">Pendiente</Pill>
 * 
 * @example
 * // Uso en tabla de riesgos
 * <td>
 *   <Pill variant="danger">{row.consecutive_absences}</Pill>
 * </td>
 */
export default function Pill({ children, variant = "danger" }) {
  
  // Determina la clase CSS según la variante
  // Usa operador ternario encadenado para evaluar cada caso
  const cls =
    variant === "warning"
      ? "pill pill--warning"   // Amarillo/naranja
      : variant === "neutral"
      ? "pill pill--neutral"   // Gris
      : "pill pill--danger";   // Rojo (por defecto si no coincide)

  return (
    // Span inline con la clase calculada
    <span className={cls}>{children}</span>
  );
}
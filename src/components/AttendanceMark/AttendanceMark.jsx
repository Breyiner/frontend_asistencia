// Importa los estilos específicos para las marcas de asistencia
import "./AttendanceMark.css";

/**
 * Componente de marca visual para estados de asistencia.
 * 
 * Renderiza un pequeño indicador (badge) con un glifo que representa
 * visualmente el estado de asistencia. Cada estado tiene un símbolo único:
 * - ✓ (check) para presente
 * - X para ausente o ausencia justificada
 * - ! (exclamación) para llegada tarde
 * - ↗ (flecha) para salida temprana
 * - - (guión) para sin registrar
 * 
 * El componente soporta diferentes tamaños mediante la prop size.
 * 
 * @component
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.status - Código del estado de asistencia
 *   Valores posibles: "present", "absent", "late", "excused_absence", "early_exit", "unregistered"
 * @param {string} [props.size="md"] - Tamaño de la marca
 *   Valores posibles: "sm" (pequeño), "md" (mediano), "lg" (grande)
 * 
 * @returns {JSX.Element} Span con el glifo correspondiente al estado
 * 
 * @example
 * // Marca de presente de tamaño mediano
 * <AttendanceMark status="present" />
 * 
 * @example
 * // Marca de ausente de tamaño pequeño
 * <AttendanceMark status="absent" size="sm" />
 * 
 * @example
 * // Marca de llegada tarde de tamaño grande
 * <AttendanceMark status="late" size="lg" />
 */
export default function AttendanceMark({ status, size = "md" }) {
  
  // Construye las clases CSS combinando:
  // - Clase base "mark"
  // - Clase modificadora por estado (ej: "mark--present")
  // - Clase modificadora por tamaño (ej: "mark--md")
  // Ejemplo resultado: "mark mark--present mark--md"
  const cls = `mark mark--${status} mark--${size}`;
  
  // Determina qué glifo/símbolo mostrar según el estado
  // Usa operador ternario encadenado para evaluar cada caso
  const glyph =
    status === "present" ? "✓" :          // Check mark para presente
    status === "absent" ? "X" :           // X para ausente
    status === "late" ? "!" :             // Exclamación para tarde
    status === "excused_absence" ? "X" :  // X para ausencia justificada
    status === "early_exit" ? "↗" :       // Flecha para salida temprana
    status === "unregistered" ? "-" : ""; // Guión para sin registrar, string vacío si no coincide

  return (
    // Span inline con el glifo
    // aria-hidden="true" indica que es decorativo y no debe ser leído por lectores de pantalla
    // (el estado debería estar comunicado por texto accesible en otro lugar)
    <span className={cls} aria-hidden="true">
      {glyph}
    </span>
  );
}
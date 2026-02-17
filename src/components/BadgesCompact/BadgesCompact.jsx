// Importa React y el hook useMemo para optimización
import React, { useMemo } from "react";

// Importa estilos de badges (compartidos con otros componentes)
import "../Badge/Badge.css";

/**
 * Componente para mostrar una lista compacta de badges con overflow.
 * 
 * Muestra un número limitado de badges visibles y agrupa los restantes
 * en un badge "+N" que indica cuántos más hay. Al hacer hover sobre
 * cualquier badge, muestra un tooltip con la lista completa.
 * 
 * Características:
 * - Limita badges visibles para evitar desbordamiento horizontal
 * - Muestra contador "+N" para items ocultos
 * - Tooltip con lista completa en atributo title
 * - Personalizable mediante clases CSS
 * - Optimizado con useMemo para filtrar y procesar datos
 * 
 * @component
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array<string>} [props.items=[]] - Array de textos para badges
 * @param {number} [props.maxVisible=1] - Cantidad máxima de badges visibles
 * @param {string} [props.empty="—"] - Texto a mostrar si el array está vacío
 * @param {string} [props.badgeClassName="badge badge--purple"] - Clases CSS para badges visibles
 * @param {string} [props.moreClassName="badge badge--fill-neutral"] - Clases CSS para badge "+N"
 * @param {string} [props.separatorTitle=", "] - Separador para el tooltip de título
 * 
 * @returns {JSX.Element} Span con badges compactos o texto vacío
 * 
 * @example
 * // Mostrar solo 1 badge de 3, con +2 de overflow
 * <BadgesCompact
 *   items={["Admin", "Instructor", "Coordinador"]}
 *   maxVisible={1}
 *   badgeClassName="badge badge--purple"
 * />
 * // Renderiza: [Admin] [+2]
 * // Tooltip: "Admin, Instructor, Coordinador"
 * 
 * @example
 * // Sin overflow
 * <BadgesCompact
 *   items={["Instructor"]}
 *   maxVisible={2}
 * />
 * // Renderiza: [Instructor]
 * 
 * @example
 * // Array vacío
 * <BadgesCompact items={[]} empty="Sin roles" />
 * // Renderiza: Sin roles
 */
export default function BadgesCompact({
  items = [],
  maxVisible = 1,
  empty = "—",
  badgeClassName = "badge badge--purple",
  moreClassName = "badge badge--fill-neutral",
  separatorTitle = ", ",
}) {
  
  // Filtra el array de items para remover valores falsy (null, undefined, "", 0, false)
  // useMemo cachea el resultado y solo recalcula si items cambia
  // filter(Boolean) es equivalente a filter(item => Boolean(item))
  const list = useMemo(() => (items ?? []).filter(Boolean), [items]);

  // Si no hay items después de filtrar, muestra el texto de "vacío"
  if (!list.length) return <span>{empty}</span>;

  // Obtiene los primeros N items que serán visibles (slice no muta el array original)
  const visible = list.slice(0, maxVisible);
  
  // Calcula cuántos items quedan ocultos
  const remaining = list.length - visible.length;
  
  // Genera el texto del tooltip solo si hay items ocultos
  // join() une todos los items con el separador (ej: "Admin, Instructor, Coordinador")
  // Si remaining <= 0, title será undefined (no se muestra tooltip)
  const title = remaining > 0 ? list.join(separatorTitle) : undefined;

  return (
    // Contenedor span con estilos inline para layout flexbox
    // title: atributo HTML nativo que muestra tooltip al hacer hover
    <span
      style={{ display: "inline-flex", alignItems: "center", gap: 6, flexWrap: "nowrap" }}
      title={title}
    >
      {/* Mapea los items visibles para renderizarlos como badges
          Cada badge es un span con la clase CSS especificada */}
      {visible.map((text, idx) => (
        // Key único usando texto + índice (suficiente si no hay duplicados)
        <span key={`${text}-${idx}`} className={badgeClassName}>
          {/* Texto interno del badge con clase específica */}
          <span className="badge__text">{text}</span>
        </span>
      ))}

      {/* Badge de overflow "+N" - solo se muestra si hay items ocultos
          Renderizado condicional con operador ternario */}
      {remaining > 0 ? (
        <span className={moreClassName}>
          {/* Muestra "+2", "+5", etc. según cantidad de items ocultos */}
          <span className="badge__text">+{remaining}</span>
        </span>
      ) : null}
    </span>
  );
}
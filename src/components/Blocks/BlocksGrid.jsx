// Importa los estilos del sistema de grid de bloques
import "./BlocksGrid.css";

// Importa el componente Card para envolver secciones
import Card from "../Card/Card";

/**
 * Componente de sistema de grid flexible para organizar contenido en bloques.
 * 
 * Proporciona un layout de dos áreas principales:
 * 1. Área principal (izquierda): Una o más secciones con layout de 1-2 columnas
 * 2. Barra lateral (derecha): Stack vertical de tarjetas opcionales
 * 
 * Cada sección en el área principal puede tener:
 * - Columna izquierda con bloques (siempre presente)
 * - Columna derecha con bloques (opcional)
 * - Footer común para toda la sección
 * 
 * Cada bloque puede tener:
 * - Título opcional (h3)
 * - Contenido (cualquier React node)
 * 
 * Este sistema es útil para páginas complejas como dashboards, perfiles,
 * configuraciones, etc. donde se necesita organizar información heterogénea.
 * 
 * @component
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array<Object>} [props.sections=[]] - Array de secciones para el área principal
 * @param {Array<Object>} [props.sections[].left] - Bloques de la columna izquierda
 * @param {string} [props.sections[].left[].title] - Título opcional del bloque
 * @param {React.ReactNode} props.sections[].left[].content - Contenido del bloque
 * @param {Array<Object>} [props.sections[].right] - Bloques de la columna derecha (opcional)
 * @param {React.ReactNode} [props.sections[].footer] - Footer de la sección (opcional)
 * @param {Array<Object>} [props.side=[]] - Array de tarjetas para la barra lateral
 * @param {string} [props.side[].title] - Título de la tarjeta lateral
 * @param {string} [props.side[].variant] - Variante de estilo de la tarjeta
 * @param {React.ReactNode} props.side[].content - Contenido de la tarjeta lateral
 * 
 * @returns {JSX.Element} Grid con secciones principales y barra lateral opcional
 * 
 * @example
 * // Dashboard con una sección de 2 columnas y sidebar
 * <BlocksGrid
 *   sections={[
 *     {
 *       left: [
 *         { title: "Información Personal", content: <UserForm /> }
 *       ],
 *       right: [
 *         { title: "Estadísticas", content: <StatsWidget /> }
 *       ],
 *       footer: <SaveButton />
 *     }
 *   ]}
 *   side={[
 *     { title: "Ayuda", variant: "info", content: <HelpText /> }
 *   ]}
 * />
 * 
 * @example
 * // Sección simple de una columna sin sidebar
 * <BlocksGrid
 *   sections={[
 *     {
 *       left: [
 *         { title: "Configuración", content: <SettingsForm /> },
 *         { content: <AdditionalOptions /> }
 *       ]
 *     }
 *   ]}
 * />
 */
export default function BlocksGrid({
    sections = [],
    side = []
}) {
    return (
        // Contenedor principal del grid
        <div className="blocks-grid">
            
            {/* Contenedor de las secciones principales (área izquierda/centro) */}
            <div className="blocks-grid__container-sections">
                
                {/* Mapea cada sección del array sections
                    secIdx: índice de la sección usado como key */}
                {sections.map((section, secIdx) => {
                    // Si la sección es null/undefined, no renderiza nada (early return)
                    if (!section) return;
                    
                    // Desestructura la sección con valores por defecto
                    const { left = [], right = [], footer } = section;
                    
                    // Determina si existe columna derecha (array con elementos)
                    const hasRight = Array.isArray(right) && right.length > 0;

                    return (
                        // Contenedor de la sección
                        <div key={secIdx} className="blocks-grid__section">
                            
                            {/* Card que envuelve todo el contenido de la sección */}
                            <Card variant="default" className="blocks-grid__main-card">
                                
                                {/* Contenedor de columnas (1 o 2 según hasRight)
                                    Aplica clase --single si solo hay columna izquierda */}
                                <div className={`blocks-grid__cols ${hasRight ? "" : "blocks-grid__cols--single"}`}>
                                    
                                    {/* Columna izquierda (siempre presente) */}
                                    <div className="blocks-grid__col">
                                        
                                        {/* Mapea cada bloque de la columna izquierda
                                            idx: índice del bloque usado como key */}
                                        {left.map((b, idx) => (
                                            // Section semántico para cada bloque
                                            <section key={idx} className="blocks-grid__block">
                                                
                                                {/* Título del bloque (h3) - solo si existe
                                                    Renderizado condicional */}
                                                {b.title ? <h3 className="blocks-grid__title">{b.title}</h3> : null}
                                                
                                                {/* Contenido del bloque - siempre presente */}
                                                <div className="blocks-grid__content">{b.content}</div>
                                            </section>
                                        ))}
                                    </div>

                                    {/* Columna derecha (opcional) - solo si hasRight es true
                                        Misma estructura que la columna izquierda */}
                                    {hasRight ? (
                                        <div className="blocks-grid__col">
                                            {right.map((b, idx) => (
                                                <section key={idx} className="blocks-grid__block">
                                                    {b.title ? <h3 className="blocks-grid__title">{b.title}</h3> : null}
                                                    <div className="blocks-grid__content">{b.content}</div>
                                                </section>
                                            ))}
                                        </div>
                                    ) : null}
                                </div>

                                {/* Footer de la sección - solo si existe
                                    Común para ambas columnas, aparece al final de la Card */}
                                {footer ? <div className="blocks-grid__footer">{footer}</div> : null}
                            </Card>
                        </div>
                    );
                })}
            </div>

            {/* Barra lateral (sidebar) - solo si side tiene elementos
                Renderizado condicional verificando length */}
            {side?.length ? (
                <aside className="blocks-grid__side">
                    
                    {/* Mapea cada tarjeta de la barra lateral
                        idx: índice usado como key */}
                    {side.map((c, idx) => (
                        // Cada elemento de la sidebar es una Card
                        <Card 
                            key={idx} 
                            title={c.title}                          // Título de la Card
                            variant={c.variant || "default"}         // Variante o default
                        >
                            {/* Contenido de la tarjeta lateral */}
                            {c.content}
                        </Card>
                    ))}
                </aside>
            ) : null}
        </div>
    );
}
// Importa los estilos específicos del componente de tarjeta de autenticación
import "./AuthCard.css";

/**
 * Componente de tarjeta para páginas de autenticación (login/registro).
 * 
 * Proporciona un diseño de dos columnas:
 * - Columna izquierda: contenido visual (imagen, ilustración, logo)
 * - Columna derecha: formulario con título, subtítulo y contenido
 * 
 * Este componente establece la estructura base para las páginas de login
 * y registro, permitiendo inyectar contenido personalizado en cada sección.
 * 
 * @component
 * 
 * @param {Object} props - Propiedades del componente
 * @param {React.ReactNode} props.left - Contenido de la columna izquierda (imagen, logo, etc.)
 * @param {string} props.title - Título principal de la tarjeta (ej: "Iniciar Sesión")
 * @param {string} [props.subtitle] - Subtítulo opcional bajo el título
 * @param {React.ReactNode} props.children - Contenido principal (formulario, botones, etc.)
 * 
 * @returns {JSX.Element} Tarjeta de autenticación con diseño de dos columnas
 * 
 * @example
 * // Uso en página de login
 * <AuthCard
 *   left={<img src="/login-illustration.svg" alt="Login" />}
 *   title="Bienvenido de nuevo"
 *   subtitle="Ingresa tus credenciales para continuar"
 * >
 *   <LoginForm />
 * </AuthCard>
 * 
 * @example
 * // Uso en página de registro
 * <AuthCard
 *   left={<BrandLogo />}
 *   title="Crear cuenta"
 * >
 *   <RegisterForm />
 * </AuthCard>
 */
export default function AuthCard({ left, title, subtitle, children }) {
    return (
        // Contenedor principal de la tarjeta
        <div className="auth-card">
            
            {/* Columna izquierda - Contenido visual
                Renderiza cualquier contenido pasado en la prop 'left' */}
            <div className="auth-card__left">{left}</div>

            {/* Columna derecha - Formulario y contenido */}
            <div className="auth-card__right">
                
                {/* Cabecera de la columna derecha con título y subtítulo */}
                <div className="auth-card_rightHeader">

                    {/* Título principal (h2 para jerarquía semántica adecuada) */}
                    <h2 className="auth-card__title">{title}</h2>
                    
                    {/* Subtítulo opcional - solo se renderiza si existe
                        Renderizado condicional con && */}
                    {subtitle && <p className="auth-card__subtitle">{subtitle}</p>}
                </div>
                
                {/* Contenido principal - renderiza children (formularios, botones, etc.)
                    Aquí se inyecta el contenido específico de cada página */}
                {children}
            </div>


        </div>
    );
}
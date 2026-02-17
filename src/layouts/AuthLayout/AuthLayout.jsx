// Importa componentes y hooks de react-router-dom
import { Outlet, useLocation } from "react-router-dom";

// Importa componentes del layout de autenticación
import AuthCard from "../../components/AuthCard/AuthCard";
import AuthTabs from "../../components/AuthTabs/AuthTabs";

// Importa estilos del layout de autenticación
import "./AuthLayout.css";

// Importa useEffect para efectos secundarios
import { useEffect } from "react";

/**
 * Componente de layout para páginas de autenticación (login/registro).
 * 
 * Proporciona la estructura visual y lógica para las páginas de login y registro:
 * - Card visual centrado con dos columnas (branding + formulario)
 * - Pestañas para alternar entre login y registro
 * - Contenido dinámico según la ruta (login vs registro)
 * - Precarga de audio de notificaciones (mejora UX)
 * 
 * Funcionalidades clave:
 * - Detección automática de ruta (login vs registro)
 * - Títulos y subtítulos dinámicos
 * - Clases CSS dinámicas para estilos diferentes
 * - Desbloqueo de audio en navegadores modernos (autoplay policy)
 * 
 * Estructura visual:
 * ┌──────────────────────────────────────┐
 * │  AuthCard                            │
 * │  ┌──────────┬──────────────────────┐ │
 * │  │          │  Título              │ │
 * │  │  Logo +  │  Subtítulo           │ │
 * │  │  Branding│  AuthTabs            │ │
 * │  │          │  Outlet (form)       │ │
 * │  └──────────┴──────────────────────┘ │
 * └──────────────────────────────────────┘
 * 
 * @component
 * @returns {JSX.Element} Layout de autenticación completo
 * 
 * @example
 * // Uso en configuración de rutas
 * <Routes>
 *   <Route element={<AuthLayout />}>
 *     <Route path="/login" element={<LoginPage />} />
 *     <Route path="/register" element={<RegisterPage />} />
 *   </Route>
 * </Routes>
 */
export default function AuthLayout() {
  
  /**
   * Hook para obtener la ubicación actual.
   * Desestructura solo pathname porque es lo único que necesitamos.
   */
  const { pathname } = useLocation();

  /**
   * Determina si estamos en la página de registro.
   * Verifica si la ruta comienza con "/register".
   */
  const isRegister = pathname.startsWith("/register");

  /**
   * Clase CSS dinámica según la página.
   * Se usa para aplicar estilos diferentes a login vs registro.
   * Valores posibles: "register" o "login"
   */
  const wrapperClass = isRegister ? "register" : "login";
  
  /**
   * Título dinámico según la página.
   * - Registro: "Crea tu cuenta"
   * - Login: "Bienvenido de nuevo"
   */
  const title = isRegister ? "Crea tu cuenta" : "Bienvenido de nuevo";
  
  /**
   * Subtítulo dinámico según la página.
   * Proporciona contexto adicional al usuario sobre qué hacer.
   */
  const subtitle = isRegister
    ? "Completa los datos para registrarte"
    : "Ingresa tus credenciales para continuar";

  /**
   * Efecto para desbloquear audio en navegadores modernos.
   * 
   * Problema que resuelve:
   * Los navegadores modernos (Chrome, Safari, Firefox) bloquean el autoplay
   * de audio hasta que el usuario interactúe con la página. Esto previene
   * que las notificaciones suenen la primera vez.
   * 
   * Solución:
   * En el primer click/tap del usuario, reproduce y pausa el audio silenciosamente.
   * Esto "desbloquea" el contexto de audio para futuras reproducciones.
   * 
   * Proceso:
   * 1. Crea instancia de Audio con el archivo de notificaciones
   * 2. Configura volumen moderado (0.6)
   * 3. Espera el primer pointerdown (click o tap)
   * 4. Reproduce y pausa inmediatamente
   * 5. El audio queda desbloqueado para futuras notificaciones
   */
  useEffect(() => {
    // Crea instancia de Audio con el archivo de sonido de notificaciones
    const audio = new Audio("/sounds/sound_notification.mp3");
    
    // Precarga el audio para que esté listo
    audio.preload = "auto";
    
    // Volumen moderado (0.6 = 60%)
    audio.volume = 0.6;

    /**
     * Función que desbloquea el audio.
     * 
     * Reproduce y pausa inmediatamente el audio para satisfacer
     * la política de autoplay del navegador.
     */
    const unlock = () => {
      audio.play()
        .then(() => {
          // Si reproduce exitosamente, pausa inmediatamente
          audio.pause();
          // Resetea el tiempo a 0 para futuras reproducciones
          audio.currentTime = 0;
        })
        .catch(() => {
          // Si falla, no hace nada (silencioso)
          // Puede fallar en navegadores muy restrictivos
        });
    };

    /**
     * Agrega listener para el primer pointerdown.
     * 
     * pointerdown: funciona para mouse y touch (mejor que click)
     * { once: true }: se ejecuta solo una vez y se remueve automáticamente
     */
    window.addEventListener("pointerdown", unlock, { once: true });

    /**
     * Cleanup: remueve el listener al desmontar.
     * Aunque { once: true } lo remueve automáticamente,
     * esto asegura limpieza si el componente se desmonta antes del click.
     */
    return () => window.removeEventListener("pointerdown", unlock);
  }, []); // Array vacío: solo se ejecuta al montar

  return (
    // Contenedor principal del layout de autenticación
    <div className="auth-layout">
      
      {/* AuthCard proporciona la estructura visual de dos columnas */}
      <AuthCard
        title={title}
        subtitle={subtitle}
        
        /* Prop left: contenido de la columna izquierda (branding) */
        left={
          <div className={`${wrapperClass}__brand`}>
            
            {/* Contenedor del logo */}
            <div className={`${wrapperClass}__logo`}>
              <img
                src="/logo_sena_white.png"
                alt="Logo SENA"
                className={`${wrapperClass}__logoImg`}
              />
            </div>
            
            {/* Texto de branding de la aplicación */}
            <div className={`${wrapperClass}__brandText`}>Asistencia SENA</div>
          </div>
        }
      >
        {/* Contenido de la columna derecha (dentro de AuthCard) */}
        
        {/* Pestañas para alternar entre Login y Registro */}
        <AuthTabs />
        
        {/* Outlet renderiza el formulario de login o registro
            según la ruta actual (/login o /register) */}
        <Outlet />
      </AuthCard>
    </div>
  );
}
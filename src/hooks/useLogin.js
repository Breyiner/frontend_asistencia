// Importa hooks de React
import { useState } from "react";

// Importa hook de navegación de react-router-dom
import { useNavigate } from "react-router-dom";

// Importa cliente de API
import { api } from "../services/apiClient";

// Importa utilidades de alertas (SweetAlert2 o similar)
import { success, error } from "../utils/alertas";

// Importa utilidad para guardar sesión en localStorage/sessionStorage
import { setSession } from "../utils/auth";

/**
 * Hook personalizado para gestionar el proceso de inicio de sesión.
 * 
 * Maneja toda la lógica de autenticación:
 * - Envío de credenciales al backend
 * - Manejo de estados de carga
 * - Gestión de errores
 * - Almacenamiento de sesión
 * - Navegación post-login
 * - Retroalimentación visual al usuario (alertas)
 * 
 * Flujo de login:
 * 1. Usuario envía email y password
 * 2. Hook hace POST a /login
 * 3. Si es exitoso: guarda sesión y redirige a /home
 * 4. Si falla: muestra mensaje de error
 * 
 * @hook
 * 
 * @returns {Object} Objeto con funciones y estado del login
 * @returns {Function} returns.login - Función async para iniciar sesión
 * @returns {boolean} returns.loading - Estado de carga durante el proceso
 * @returns {string} returns.error - Mensaje de error si la autenticación falla
 * 
 * @example
 * function LoginPage() {
 *   const { login, loading, error } = useLogin();
 *   
 *   const handleSubmit = async (e) => {
 *     e.preventDefault();
 *     await login({ email: form.email, password: form.password });
 *   };
 *   
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <input name="email" />
 *       <input name="password" type="password" />
 *       <button disabled={loading}>
 *         {loading ? "Iniciando..." : "Iniciar Sesión"}
 *       </button>
 *       {error && <p>{error}</p>}
 *     </form>
 *   );
 * }
 */
export function useLogin() {
  
  // Hook de navegación para redirigir después del login
  const navigate = useNavigate();
  
  // Estado de carga durante el proceso de autenticación
  const [loading, setLoading] = useState(false);
  
  // Estado para almacenar mensajes de error
  const [errorMsg, setErrorMsg] = useState("");

  /**
   * Función asíncrona para iniciar sesión.
   * 
   * Proceso:
   * 1. Activa estado de carga y limpia errores previos
   * 2. Envía POST con credenciales a endpoint de login
   * 3. Si es exitoso: muestra alerta de éxito, guarda sesión, redirige
   * 4. Si falla: muestra alerta de error y establece mensaje de error
   * 5. Siempre desactiva estado de carga al finalizar (finally)
   * 
   * @async
   * @param {Object} credentials - Credenciales de inicio de sesión
   * @param {string} credentials.email - Email del usuario
   * @param {string} credentials.password - Contraseña del usuario
   * @returns {Promise<Object|null>} Objeto de respuesta o null si hay error
   */
  const login = async ({ email, password }) => {
    // Activa estado de carga
    setLoading(true);
    
    // Limpia mensaje de error anterior
    setErrorMsg("");

    try {
      // Envía POST a endpoint de login con credenciales
      const res = await api.post("login", { email, password });
      
      
      // Verifica si la respuesta indica fallo
      if (!res.ok) {
        // Extrae mensaje de error o usa mensaje por defecto
        const msg = res.message || "No se pudo iniciar sesión";
        
        // Establece mensaje de error en el estado
        setErrorMsg(msg);
        
        // Muestra alerta de error al usuario
        await error(msg);
        
        // Retorna la respuesta para que el componente pueda manejarla
        return res;
      }

      // Login exitoso: muestra alerta de éxito
      await success(res.message || "Operación exitosa");
      
      // Guarda los datos de sesión (token, usuario, etc.) en storage
      // Típicamente guarda en localStorage o sessionStorage
      setSession(res.data);
      
      // Navega a la página principal
      // replace: true evita que el usuario vuelva a login con botón atrás
      navigate("/home", { replace: true });
      
      // Retorna la respuesta exitosa
      return res;
      
    } catch (e) {
      // Captura errores de red o excepciones inesperadas
      const msg = e.message || "Error de conexión. Intenta de nuevo.";
      
      // Establece mensaje de error
      setErrorMsg(msg);
      
      // Muestra alerta de error
      await error(msg);
      
      // Retorna null indicando fallo crítico
      return null;
      
    } finally {
      // Siempre se ejecuta: desactiva estado de carga
      setLoading(false);
    }
  };

  // Retorna función de login y estados
  // error (renombrado desde errorMsg) para coincidir con convención
  return { login, loading, error: errorMsg };
}
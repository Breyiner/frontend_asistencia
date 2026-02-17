// Importa useEffect de React
import { useEffect } from "react";

// Importa store de notificaciones
import { useNotificationsStore } from "../../stores/notificationsStore";

// Importa utilidades de autenticación
import { getCurrentRoleCode, getUser } from "../../utils/auth";

/**
 * Componente bootstrapper para inicializar el sistema de notificaciones.
 * 
 * Este componente no renderiza nada visible (retorna null).
 * Su único propósito es ejecutar la inicialización del store
 * de notificaciones cuando la aplicación carga.
 * 
 * Funcionalidad:
 * - Obtiene información del usuario autenticado
 * - Obtiene el rol activo actual
 * - Inicializa el store de notificaciones con estos datos
 * - Se ejecuta una sola vez al montar el componente
 * 
 * Debe incluirse en el layout principal de la aplicación,
 * típicamente antes de NotificationBell.
 * 
 * @component
 * 
 * @returns {null} No renderiza nada
 * 
 * @example
 * // Uso típico en AppHeader o Layout principal
 * <AppHeader>
 *   <NotificationsBootstrapper />
 *   <NotificationBell />
 *   <RoleSelector />
 * </AppHeader>
 */
export default function NotificationsBootstrapper() {
  
  /**
   * Efecto de inicialización del sistema de notificaciones.
   * 
   * Se ejecuta una sola vez al montar el componente (array de dependencias vacío).
   * 
   * Proceso:
   * 1. Obtiene usuario actual del sistema de autenticación
   * 2. Obtiene código del rol activo
   * 3. Si hay usuario, inicializa el store de notificaciones
   * 4. El store se encarga de configurar polling, WebSockets, etc.
   */
  useEffect(() => {
    // Obtiene el usuario autenticado del sistema
    const user = getUser();
    
    // Obtiene el código del rol actualmente activo
    const roleCode = getCurrentRoleCode();
    
    // Si no hay usuario (no autenticado), no hace nada
    if (!user?.id) return;

    // Inicializa el store de notificaciones
    // getState() obtiene el estado actual del store
    // bootstrap() es un método del store que configura todo el sistema
    useNotificationsStore.getState().bootstrap({ 
      userId: user.id,           // ID del usuario para cargar sus notificaciones
      actingRoleCode: roleCode   // Rol activo para filtrar notificaciones relevantes
    });
  }, []); // Array vacío: solo se ejecuta al montar

  // No renderiza nada (componente de utilidad/lógica)
  return null;
}
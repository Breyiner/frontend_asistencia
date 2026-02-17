// Importa Laravel Echo para conexiones WebSocket
import Echo from "laravel-echo";

// Importa Pusher (cliente WebSocket)
import Pusher from "pusher-js";

// Importa utilidad para obtener token de autenticación
import { getToken } from "../utils/auth";

/**
 * Expone Pusher globalmente en window.
 * 
 * Laravel Echo requiere que Pusher esté disponible en window
 * para funcionar correctamente con el broadcaster "reverb".
 * 
 * Esto es necesario porque Echo usa Pusher internamente
 * y espera encontrarlo en el scope global.
 */
window.Pusher = Pusher;

/**
 * Obtiene el token de autenticación del usuario actual.
 * 
 * Este token se usa para autenticar las conexiones WebSocket
 * con el backend, permitiendo que el usuario se suscriba
 * a canales privados y de presencia.
 */
const token = getToken();

/**
 * Instancia de Laravel Echo configurada para Laravel Reverb.
 * 
 * Laravel Reverb es un servidor WebSocket de Laravel que reemplaza
 * a Pusher para comunicación en tiempo real.
 * 
 * Configuración:
 * - broadcaster: "reverb" (servidor WebSocket de Laravel)
 * - key: clave de la aplicación Reverb (desde .env)
 * - wsHost: host del servidor WebSocket
 * - wsPort/wssPort: puerto para conexiones ws/wss
 * - forceTLS: false (permite conexiones no seguras en desarrollo)
 * - enabledTransports: ["ws", "wss"] (permite ambos protocolos)
 * - authEndpoint: endpoint del backend para autenticar canales privados
 * - auth.headers: headers de autenticación con Bearer token
 * 
 * Variables de entorno necesarias:
 * - VITE_REVERB_APP_KEY: clave de la app Reverb
 * - VITE_REVERB_HOST: host del servidor (ej: "localhost")
 * - VITE_REVERB_PORT: puerto del servidor (ej: 8080)
 * 
 * Uso típico:
 * - Escuchar notificaciones en tiempo real
 * - Chat en vivo
 * - Actualizaciones de estado
 * - Sincronización entre usuarios
 * 
 * @constant
 * @type {Echo}
 * 
 * @example
 * // Escuchar notificaciones privadas del usuario
 * import echo from './services/echo';
 * 
 * echo.private(`user.${userId}`)
 *   .notification((notification) => {
 *     console.log('Nueva notificación:', notification);
 *   });
 * 
 * @example
 * // Escuchar evento específico en canal público
 * echo.channel('public-updates')
 *   .listen('DataUpdated', (event) => {
 *     console.log('Datos actualizados:', event);
 *   });
 * 
 * @example
 * // Canal de presencia (quién está conectado)
 * echo.join('ficha.123')
 *   .here((users) => {
 *     console.log('Usuarios conectados:', users);
 *   })
 *   .joining((user) => {
 *     console.log('Usuario se unió:', user);
 *   })
 *   .leaving((user) => {
 *     console.log('Usuario salió:', user);
 *   });
 */
const echo = new Echo({
    // Broadcaster: tipo de servidor WebSocket
    // "reverb" es el servidor WebSocket nativo de Laravel
    broadcaster: "reverb",
    
    // Clave de la aplicación Reverb (desde variables de entorno)
    // Se usa para identificar la aplicación en el servidor
    key: import.meta.env.VITE_REVERB_APP_KEY,
    
    // Host del servidor WebSocket
    // En desarrollo típicamente "localhost", en producción el dominio
    wsHost: import.meta.env.VITE_REVERB_HOST,
    
    // Puerto para conexiones WebSocket (ws://)
    // Convierte a número con fallback a 8080 si no está definido
    wsPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
    
    // Puerto para conexiones WebSocket seguras (wss://)
    // Típicamente el mismo que wsPort
    wssPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
    
    // forceTLS: false permite conexiones no seguras (http/ws)
    // En producción debería ser true para forzar https/wss
    forceTLS: false,
    
    // Transportes habilitados: WebSocket y WebSocket Secure
    // Permite conexiones tanto ws:// como wss://
    enabledTransports: ["ws", "wss"],

    // Endpoint del backend para autenticar canales privados
    // Laravel usa este endpoint para validar que el usuario
    // tiene permiso para suscribirse a un canal privado
    authEndpoint: "http://localhost:8000/api/broadcasting/auth",

    // Configuración de autenticación
    auth: {
        // Headers enviados al authEndpoint
        headers: {
            // Bearer token para autenticar al usuario
            Authorization: `Bearer ${token}`,
            
            // Accept header para especificar formato de respuesta
            Accept: "application/json",
        },
    },
});

/**
 * Exporta la instancia de Echo configurada.
 * 
 * Esta instancia se importa en toda la aplicación para
 * gestionar conexiones WebSocket en tiempo real.
 */
export default echo;
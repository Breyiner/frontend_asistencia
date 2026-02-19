// Importa Laravel Echo para conexiones WebSocket
import Echo from "laravel-echo";

// Importa Pusher (cliente WebSocket)
import Pusher from "pusher-js";

// Importa utilidad para obtener token de autenticación
import { getToken } from "../utils/auth";

/**
 * ✅ Pusher debe estar disponible globalmente en window.Pusher
 * 
 * Laravel Echo con broadcaster "reverb" internamente usa Pusher.js
 * como cliente WebSocket. Echo busca Pusher en window global.
 * 
 * Sin esto, obtendrás error: "Pusher is not defined"
 */
window.Pusher = Pusher;

/**
 * ✅ Token Bearer para autenticar canales privados
 * 
 * Laravel verifica permisos en /broadcasting/auth usando Sanctum/Passport
 * Este token identifica al usuario autenticado
 */
const token = getToken();

/**
 * 🎯 INSTANCIA PRINCIPAL DE LARAVEL ECHO + REVERB
 * 
 * Configuración optimizada para desarrollo local:
 * - localhost:8080 (Reverb server)
 * - localhost:8000 (Laravel API)
 * 
 * En producción cambiar a:
 * - ws.dominio.com:443 (wss://)
 * - api.dominio.com (API)
 */
const echo = new Echo({
    // 🔑 BROADCASTER: "reverb" = servidor WebSocket nativo de Laravel
    broadcaster: "reverb",
    
    // 📋 CLAVE PÚBLICA (desde .env VITE_REVERB_APP_KEY)
    // Identifica tu aplicación en el servidor Reverb
    key: import.meta.env.VITE_REVERB_APP_KEY,
    
    // 🏠 HOST WEBSOCKET (desde .env VITE_REVERB_HOST)
    // Desarrollo: "localhost"
    // Producción: "ws.tudominio.com"
    wsHost: import.meta.env.VITE_REVERB_HOST,
    
    // 🔌 PUERTOS WEBSOCKET (desde .env VITE_REVERB_PORT)
    // Desarrollo: 8080 (ws://)
    // Producción: 443 (wss://)
    wsPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
    wssPort: Number(import.meta.env.VITE_REVERB_PORT ?? 443),
    
    // 🔒 TLS: false = desarrollo (http/ws), true = producción (https/wss)
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
    
    // 🚚 TRANSPORTES: ws (no seguro) + wss (seguro)
    enabledTransports: ["ws", "wss"],

    // 🔐 AUTENTICACIÓN CANALES PRIVADOS
    authEndpoint: `${import.meta.env.VITE_API_URL ?? 'http://localhost:8000'}/api/broadcasting/auth`,
    
    auth: {
        headers: {
            // Bearer token para Laravel Sanctum/Passport
            Authorization: `Bearer ${token}`,
            // JSON responses esperados
            Accept: "application/json",
            // CSRF opcional si usas cookies
            // 'X-XSRF-TOKEN': getCsrfToken(),
        },
    },
});

/**
 * 🧪 PRUEBAS RÁPIDAS (descomenta para debug)
 */
// echo.connector.pusher.connection.bind('connected', () => {
//     console.log('✅ WebSocket conectado a Reverb');
// });
// echo.connector.pusher.connection.bind('error', (err) => {
//     console.error('❌ WebSocket error:', err);
// });

/**
 * 📤 EXPORTA PARA USO GLOBAL
 * 
 * Uso en componentes React:
 * import echo from '@/services/echo';
 * 
 * echo.private(`user.${userId}`).listen('NotificationReceived', (e) => {
 *     toast.success(e.message);
 * });
 */
export default echo;

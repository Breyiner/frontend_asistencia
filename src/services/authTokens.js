// Importa utilidad para obtener cookies
import { getCookie } from "../utils/getCookies";

/**
 * URL base del backend API.
 * 
 * En desarrollo apunta a localhost:8000.
 * En producción debería ser la URL del servidor de producción.
 * 
 * TODO: Mover a variable de entorno (VITE_API_URL)
 * 
 * @constant
 * @type {string}
 */
const urlBase = "http://localhost:8000/api";

/**
 * Refresca el access token usando el refresh token.
 * 
 * Flujo de autenticación con tokens:
 * 1. Usuario hace login → recibe access_token y refresh_token
 * 2. access_token expira después de X tiempo (ej: 15 minutos)
 * 3. En lugar de pedir login de nuevo, usa refresh_token
 * 4. Backend valida refresh_token y emite nuevo access_token
 * 5. Usuario continúa navegando sin interrupciones
 * 
 * Esta función se llama automáticamente desde apiClient.js
 * cuando el backend retorna error de autenticación (401).
 * 
 * Proceso:
 * 1. Obtiene refresh_token de las cookies
 * 2. Envía POST a /refresh_token
 * 3. Backend establece nuevo access_token en cookies
 * 4. Siguiente petición usará el nuevo token
 * 
 * Nota: No retorna nada porque el backend establece
 * el nuevo access_token directamente en las cookies.
 * 
 * Cookies involucradas:
 * - refresh_token: token de larga duración para refrescar
 * - access_token: token de corta duración para autenticar (actualizado por backend)
 * 
 * @async
 * @function
 * @returns {Promise<void>} No retorna valor, el backend actualiza cookies
 * 
 * @example
 * // Uso interno en apiClient.js
 * if (response.status === 401) {
 *   await refreshToken();
 *   // Reintenta la petición con el nuevo token
 *   const retryResponse = await fetch(url, options);
 * }
 */
export async function refreshToken() {
  // Envía POST al endpoint de refresh
  await fetch(`${urlBase}/refresh_token`, {
    // Método HTTP
    method: "POST",
    
    // credentials: "include" envía cookies automáticamente
    // Necesario para que el backend pueda establecer nuevas cookies
    credentials: "include",
    
    // Headers de la petición
    headers: {
      // Content-Type para JSON
      "Content-Type": "application/json",
      
      // Authorization con el refresh token
      // El backend valida este token antes de emitir uno nuevo
      Authorization: `Bearer ${getCookie("refresh_token")}`,
    },
    
    // Body vacío (el token va en el header)
    // JSON.stringify([]) envía array vacío como JSON
    body: JSON.stringify([]),
  });
  
  // No necesita procesar la respuesta porque:
  // 1. El backend establece el nuevo access_token en cookies automáticamente
  // 2. Las siguientes peticiones usarán el nuevo token de las cookies
}
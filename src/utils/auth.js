// Importa utilidad para obtener cookies
import { getCookie } from "./getCookies";

/**
 * Claves usadas en localStorage y cookies.
 * 
 * Centraliza los nombres de las claves para evitar typos
 * y facilitar cambios futuros.
 * 
 * @constant
 */
const KEYS = {
  token: "access_token",           // Access token en cookie
  refreshToken: "refresh_token",   // Refresh token en cookie
  user: "user_data",               // Datos de usuario en localStorage
  currentRoleId: "current_role_id", // ID del rol activo en localStorage
  permissions: "permissions",       // No usado actualmente (legacy)
};

/**
 * Obtiene el access token de las cookies.
 * 
 * @function
 * @returns {string} Access token o string vacío si no existe
 * 
 * @example
 * const token = getToken();
 * // "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 */
export function getToken() {
  return getCookie(KEYS.token) || "";
}

/**
 * Verifica si el usuario está autenticado.
 * 
 * Considera autenticado si existe un access token.
 * No valida si el token es válido, solo si existe.
 * 
 * @function
 * @returns {boolean} true si hay token, false si no
 * 
 * @example
 * if (isAuth()) {
 *   // Usuario autenticado
 * } else {
 *   // Redirigir a login
 * }
 */
export function isAuth() {
  return Boolean(getToken());
}

/**
 * Obtiene los datos del usuario desde localStorage.
 * 
 * Parsea el JSON almacenado de forma segura.
 * Retorna null si no existe o si hay error de parsing.
 * 
 * @function
 * @returns {Object|null} Objeto de usuario o null
 * 
 * @example
 * const user = getUser();
 * console.log(user.name, user.email);
 */
export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.user) || "null");
  } catch {
    // Si hay error al parsear, retorna null
    return null;
  }
}

/**
 * Establece la sesión del usuario después de login.
 * 
 * Guarda:
 * - Datos de usuario en localStorage
 * - ID del primer rol como rol activo
 * 
 * Nota: Los tokens se establecen en cookies automáticamente
 * por el backend (con httpOnly para seguridad).
 * 
 * @function
 * @param {Object} params - Datos de sesión
 * @param {Object} params.user - Objeto de usuario del backend
 * @param {Array} params.user.roles - Roles del usuario
 * 
 * @example
 * // Después de login exitoso
 * setSession({ user: responseData.user });
 */
export function setSession({ user }) {
  // Guarda datos de usuario en localStorage
  localStorage.setItem(KEYS.user, JSON.stringify(user));
  
  // Establece el primer rol como rol activo por defecto
  localStorage.setItem(KEYS.currentRoleId, String(user.roles[0].id || 0));
}

/**
 * Obtiene el ID del rol activo actual.
 * 
 * @function
 * @returns {string} ID del rol activo o "0" si no existe
 * 
 * @example
 * const roleId = getCurrentRoleId(); // "3"
 */
export function getCurrentRoleId() {
  return localStorage.getItem(KEYS.currentRoleId) || "0";
}

/**
 * Cambia el rol activo del usuario.
 * 
 * Usado cuando un usuario con múltiples roles cambia de rol.
 * 
 * @function
 * @param {number|string} roleId - ID del nuevo rol activo
 * 
 * @example
 * // Usuario cambia de instructor a coordinador
 * setCurrentRole(5);
 * window.location.reload(); // Recargar para aplicar cambios
 */
export function setCurrentRole(roleId) {
  localStorage.setItem(KEYS.currentRoleId, String(roleId));
}

/**
 * Obtiene el objeto completo del rol activo actual.
 * 
 * Busca en los roles del usuario el que coincida con currentRoleId.
 * Si no encuentra, retorna el primer rol.
 * 
 * @function
 * @returns {Object} Objeto del rol activo
 * 
 * @example
 * const role = getCurrentRole();
 * console.log(role.name);  // "Instructor"
 * console.log(role.code);  // "instructor"
 */
export function getCurrentRole() {
  const user = getUser();
  const roleId = parseInt(getCurrentRoleId());
  
  // Busca el rol por ID
  return user.roles.find(role => role.id === roleId) || user.roles[0];
}

/**
 * Obtiene los permisos del rol activo actual.
 * 
 * @function
 * @returns {Array<string>} Array de códigos de permisos
 * 
 * @example
 * const permissions = getCurrentPermissions();
 * // ["users.view", "users.create", "apprentices.view"]
 */
export function getCurrentPermissions() {
  const role = getCurrentRole();
  return role.permissions || [];
}

/**
 * Verifica si el usuario tiene un permiso específico.
 * 
 * @function
 * @param {string} permission - Código del permiso a verificar
 * @returns {boolean} true si tiene el permiso, false si no
 * 
 * @example
 * if (can("users.create")) {
 *   // Mostrar botón de crear usuario
 * }
 */
export function can(permission) {
  return getCurrentPermissions().includes(permission);
}

/**
 * Obtiene el código del rol activo actual.
 * 
 * El código es un identificador legible usado para lógica
 * de negocio (ej: "instructor", "coordinador", "admin").
 * 
 * @function
 * @returns {string} Código del rol o string vacío
 * 
 * @example
 * const code = getCurrentRoleCode(); // "instructor"
 */
export function getCurrentRoleCode() {
  const role = getCurrentRole();
  return role?.code || "";
}

/**
 * Verifica si el rol activo coincide con un código específico.
 * 
 * @function
 * @param {string} code - Código de rol a verificar
 * @returns {boolean} true si coincide, false si no
 * 
 * @example
 * if (isRoleCode("admin")) {
 *   // Mostrar opciones de administrador
 * }
 */
export function isRoleCode(code) {
  return getCurrentRoleCode() === code;
}

/**
 * Obtiene todos los permisos de todos los roles del usuario.
 * 
 * Aplana los permisos de todos los roles en un solo array.
 * Útil para verificaciones globales.
 * 
 * @function
 * @returns {Array<string>} Array de todos los permisos
 * 
 * @example
 * const allPerms = getAllPermissions();
 * // Incluye permisos de instructor + coordinador
 */
export function getAllPermissions() {
  const user = getUser();
  
  // flatMap aplana el array de arrays en un solo array
  return user.roles.flatMap(role => role.permissions || []);
}

/**
 * Verifica si el rol activo tiene un nombre específico.
 * 
 * @function
 * @param {string} roleName - Nombre del rol a verificar
 * @returns {boolean} true si coincide, false si no
 * 
 * @example
 * if (isRole("Instructor")) {
 *   // Lógica específica de instructor
 * }
 */
export function isRole(roleName) {
  return getCurrentRole().name === roleName;
}

/**
 * Limpia completamente la sesión del usuario.
 * 
 * Proceso:
 * 1. Remueve todos los items de localStorage
 * 2. Elimina cookies de tokens (establece max-age=0)
 * 
 * Usado al hacer logout.
 * 
 * @function
 * 
 * @example
 * // En función de logout
 * async function logout() {
 *   await api.post("logout");
 *   clearSession();
 *   navigate("/login");
 * }
 */
export function clearSession() {
  // Remueve cada clave de localStorage
  Object.values(KEYS).forEach(key => localStorage.removeItem(key));
  
  // Elimina cookie de access token
  document.cookie = `${KEYS.token}=; path=/; max-age=0`;
  
  // Elimina cookie de refresh token
  document.cookie = `${KEYS.refreshToken}=; path=/; max-age=0`;
}
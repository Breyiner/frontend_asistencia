// Importa utilidades de autenticación
import { getCurrentRoleId } from "../utils/auth";
import { getCookie } from "../utils/getCookies";
import { refreshToken } from "./authTokens";

/**
 * URL base del backend API.
 * 
 * @constant
 * @type {string}
 */
const urlBase = "http://localhost:8000/api";

/**
 * Timeout para peticiones HTTP en milisegundos.
 * 
 * Después de 8 segundos sin respuesta, la petición se aborta
 * y se retorna error de timeout.
 * 
 * @constant
 * @type {number}
 */
const TIMEOUT = 8000;

/**
 * Parsea la respuesta JSON de forma segura.
 * 
 * Algunos endpoints pueden retornar respuestas vacías o malformadas.
 * Esta función previene errores al intentar parsear JSON inválido.
 * 
 * @async
 * @function
 * @param {Response} response - Objeto Response de fetch
 * @returns {Promise<Object|null>} JSON parseado o null si falla
 */
async function parseJsonSafe(response) {
  try {
    return await response.json();
  } catch {
    // Si falla el parseo, retorna null en lugar de lanzar error
    return null;
  }
}

/**
 * Extrae el primer mensaje de error de diferentes estructuras.
 * 
 * El backend puede retornar errores en diferentes formatos:
 * - Array simple: ["Error 1", "Error 2"]
 * - Objeto de validación: { email: ["Email inválido"], name: ["Muy corto"] }
 * 
 * Esta función normaliza cualquier formato a un string simple.
 * 
 * @function
 * @param {Array|Object|undefined} errors - Errores del backend
 * @returns {string} Primer mensaje de error encontrado o string vacío
 */
function firstErrorMessage(errors) {
  // Si no hay errores, retorna vacío
  if (!errors) return "";

  // Caso 1: Array de strings
  if (Array.isArray(errors) && errors.length > 0) {
    return String(errors[0] ?? "");
  }

  // Caso 2: Objeto de validación { field: ["mensaje"] }
  if (typeof errors === "object") {
    const keys = Object.keys(errors);
    if (keys.length === 0) return "";
    
    const v = errors[keys[0]]; // Primer campo
    if (Array.isArray(v) && v.length > 0) return String(v[0] ?? "");
  }

  return "";
}

/**
 * Función principal para hacer peticiones HTTP al backend.
 * 
 * Características:
 * - Manejo automático de timeout (8 segundos)
 * - Refresh automático de token si expira
 * - Soporte para JSON y FormData
 * - Normalización de respuestas del backend
 * - Manejo de errores de red y timeout
 * - Envío automático de headers de autenticación
 * - Envío de rol activo para permisos
 * 
 * @async
 * @function
 * @param {string} method - Método HTTP (GET, POST, PATCH, DELETE)
 * @param {string} endpoint - Endpoint relativo (sin /api/)
 * @param {Object|FormData|undefined} body - Cuerpo de la petición
 * @returns {Promise<Object>} Objeto con estructura normalizada de respuesta
 */
async function request(method, endpoint, body) {
  // Crea AbortController para cancelar petición después del timeout
  const controller = new AbortController();
  
  // Programa timeout: aborta petición después de TIMEOUT milisegundos
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

  /**
   * Función interna para ejecutar el fetch.
   * Se encapsula para poder reutilizarla en caso de retry.
   */
  const doFetch = () => {
    // Headers base para todas las peticiones
    const headers = {
      // Bearer token para autenticación
      Authorization: `Bearer ${getCookie("access_token")}`,
      
      // Header personalizado con el rol activo del usuario
      // El backend usa esto para validar permisos según el rol actual
      "X-Acting-Role-Id": getCurrentRoleId(),
    };

    // Detecta si el body es FormData (para uploads de archivos)
    const isFormData = body instanceof FormData;

    // Si NO es FormData y hay body, agrega Content-Type JSON
    // FormData establece su propio Content-Type con boundary
    if (!isFormData && body) {
      headers["Content-Type"] = "application/json";
    }

    return fetch(`${urlBase}/${endpoint}`, {
      method,
      
      // credentials: "include" envía y recibe cookies automáticamente
      credentials: "include",
      
      // signal para abortar la petición si excede el timeout
      signal: controller.signal,
      
      headers,
      
      // Body: FormData tal cual, JSON stringificado, o undefined si no hay
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    });
  };

  try {
    // Limpia el timeout (se ejecutará después del fetch)
    clearTimeout(timeoutId);

    // Ejecuta la petición
    let response = await doFetch();
    let json = await parseJsonSafe(response);

    /**
     * Manejo de token expirado con retry automático.
     * 
     * Si el backend retorna errorKey "not_authenticated":
     * 1. Llama a refreshToken() para obtener nuevo access_token
     * 2. Reintenta la petición original con el nuevo token
     * 3. Si falla de nuevo, retorna el error
     * 
     * Esto hace que el usuario no note cuando su token expira.
     */
    if (json?.errorKey === "not_authenticated") {
      // Refresca el token
      await refreshToken();
      
      // Reintenta la petición con el nuevo token
      const retryResponse = await doFetch();
      json = await parseJsonSafe(retryResponse);
      response = retryResponse;
    }

    // Extrae errores de la respuesta (puede ser array u objeto)
    const errorsRaw = json?.errors ?? [];
    const errorsArr = Array.isArray(errorsRaw) ? errorsRaw : [];
    const firstErr = firstErrorMessage(errorsRaw);

    // Determina el mensaje final a mostrar
    const baseMessage = json?.message ?? "";
    const finalMessage =
      json?.success === false && firstErr ? firstErr : baseMessage;

    /**
     * Retorna objeto con estructura normalizada.
     * 
     * Todos los métodos del API retornan este formato consistente,
     * facilitando el manejo de respuestas en toda la aplicación.
     */
    return {
      // ok: true solo si success es true Y el status HTTP es 2xx
      ok: Boolean(json?.success) && response.ok,
      
      // Status HTTP (200, 404, 500, etc.)
      status: response.status,
      
      // Mensaje legible para el usuario
      message: finalMessage,
      
      // Datos de la respuesta (puede ser objeto, array, etc.)
      data: json?.data ?? null,
      
      // Información de paginación (para listas)
      paginate: json?.paginate ?? [],
      
      // Resumen/metadata adicional
      summary: json?.summary ?? null,
      
      // Array de errores (para validación de formularios)
      errors: errorsArr,
      
      // Código de error para manejo programático
      errorKey: json?.errorKey ?? null,
    };
    
  } catch (error) {
    // Limpia el timeout en caso de error
    clearTimeout(timeoutId);

    /**
     * Manejo de timeout.
     * 
     * Si AbortController abortó la petición por timeout,
     * retorna error específico de timeout.
     */
    if (error.name === "AbortError") {
      return {
        ok: false,
        status: 408, // Request Timeout
        message: "La solicitud tardó demasiado (timeout)",
        data: null,
        paginate: [],
        summary: null,
        errors: ["Timeout de 8 segundos"],
        errorKey: "timeout",
      };
    }

    /**
     * Manejo de errores de red.
     * 
     * Cualquier otro error (red caída, DNS failed, etc.)
     * retorna error genérico de conexión.
     */
    return {
      ok: false,
      status: 0, // 0 indica error de red
      message: "Error de conexión",
      data: null,
      paginate: [],
      summary: null,
      errors: [error.message],
      errorKey: "network_error",
    };
  }
}

/**
 * Función especializada para descargar archivos del backend.
 * 
 * Similar a request() pero adaptada para archivos binarios:
 * - Retorna blob en lugar de JSON
 * - Header Accept específico para Excel
 * - Manejo de refresh token para downloads
 * - Timeout de 8 segundos también aplica
 * 
 * Casos de uso:
 * - Descargar plantillas Excel
 * - Exportar reportes PDF
 * - Descargar archivos CSV
 * 
 * @async
 * @function
 * @param {string} endpoint - Endpoint relativo del archivo a descargar
 * @returns {Promise<Object>} Objeto con blob del archivo o error
 */
async function downloadFile(endpoint) {
  // Crea AbortController para timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

  /**
   * Función interna para ejecutar el fetch de descarga.
   */
  const doFetch = () =>
    fetch(`${urlBase}/${endpoint}`, {
      method: "GET",
      credentials: "include",
      signal: controller.signal,
      headers: {
        // Bearer token para autenticación
        Authorization: `Bearer ${getCookie("access_token")}`,
        
        // Rol activo para permisos
        "X-Acting-Role-Id": getCurrentRoleId(),
        
        // Accept header específico para archivos Excel
        // MIME type para .xlsx
        Accept:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });

  try {
    clearTimeout(timeoutId);
    
    // Ejecuta la petición de descarga
    let response = await doFetch();

    /**
     * Manejo de token expirado en downloads.
     * 
     * Si retorna 401, refresca token y reintenta.
     */
    if (response.status === 401) {
      await refreshToken();
      response = await doFetch();
    }

    // Si la descarga falló
    if (!response.ok) {
      return {
        ok: false,
        message: "Error al descargar el archivo",
        blob: null,
      };
    }

    // Convierte la respuesta a blob (datos binarios)
    const blob = await response.blob();

    // Retorna blob para crear URL de descarga
    return {
      ok: true,
      blob,
      message: "Archivo descargado correctamente",
    };
    
  } catch (error) {
    clearTimeout(timeoutId);

    // Manejo de timeout en downloads
    if (error.name === "AbortError") {
      return {
        ok: false,
        message: "La descarga tardó demasiado (timeout)",
        blob: null,
      };
    }

    // Error de red en descarga
    return {
      ok: false,
      message: "Error de conexión al descargar",
      blob: null,
    };
  }
}

/**
 * Objeto API con métodos para todas las operaciones HTTP.
 * 
 * Interfaz simplificada que expone solo los métodos necesarios.
 * Todos usan la función request() internamente con diferentes métodos HTTP.
 * 
 * @constant
 * @type {Object}
 */
export const api = {
  /**
   * Elimina un recurso (HTTP DELETE).
   * @param {string} endpoint - Endpoint del recurso a eliminar
   * @returns {Promise<Object>} Respuesta normalizada
   */
  delete: (endpoint) => request("DELETE", endpoint),
  
  /**
   * Crea un recurso (HTTP POST).
   * @param {string} endpoint - Endpoint donde crear
   * @param {Object|FormData} body - Datos a enviar
   * @returns {Promise<Object>} Respuesta normalizada
   */
  post: (endpoint, body) => request("POST", endpoint, body),
  
  /**
   * Actualiza parcialmente un recurso (HTTP PATCH).
   * @param {string} endpoint - Endpoint del recurso
   * @param {Object|FormData} body - Datos a actualizar
   * @returns {Promise<Object>} Respuesta normalizada
   */
  patch: (endpoint, body) => request("PATCH", endpoint, body),
  
  /**
   * Obtiene un recurso (HTTP GET).
   * @param {string} endpoint - Endpoint del recurso
   * @returns {Promise<Object>} Respuesta normalizada
   */
  get: (endpoint) => request("GET", endpoint),
  
  /**
   * Descarga un archivo binario.
   * @param {string} endpoint - Endpoint del archivo
   * @returns {Promise<Object>} Objeto con blob del archivo
   */
  downloadFile: (endpoint) => downloadFile(endpoint),
};
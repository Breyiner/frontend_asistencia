// services/apiClient.js

// ─── Utilidades de autenticación ──────────────────────────────────────────────
import { getCurrentRoleId } from "../utils/auth";
import { refreshToken }     from "./authTokens";

// ─── Configuración base ───────────────────────────────────────────────────────
const URL_BASE = "http://localhost:8000/api";
const TIMEOUT  = 8000; // ms antes de abortar la request


// ─── Helpers internos ─────────────────────────────────────────────────────────

/**
 * Parsea el body de la response como JSON sin lanzar excepción.
 * Retorna null si la response no tiene body o no es JSON válido.
 *
 * @param {Response} response - Fetch Response object
 * @returns {Promise<Object|null>}
 */
async function parseJsonSafe(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/**
 * Extrae el primer mensaje de error de distintos formatos posibles.
 *
 * Soporta:
 * · Array de strings:  ["El campo X es requerido"]
 * · Objeto de arrays:  { email: ["Ya existe"] }  (Laravel validation)
 *
 * NO se usa cuando errors es un array de objetos (ej: filas de importación),
 * ya que convertiría "[object Object]" en lugar del mensaje real.
 *
 * @param {Array|Object} errors - Errores del backend
 * @returns {string} Primer mensaje encontrado, o "" si no hay
 */
function firstErrorMessage(errors) {
  if (!errors) return "";

  if (Array.isArray(errors) && errors.length > 0) {
    return String(errors[0] ?? "");
  }

  if (typeof errors === "object") {
    const keys = Object.keys(errors);
    if (keys.length === 0) return "";
    const v = errors[keys[0]];
    if (Array.isArray(v) && v.length > 0) return String(v[0] ?? "");
  }

  return "";
}

/**
 * Construye los headers comunes para todas las requests.
 * Incluye Bearer token y rol activo del usuario autenticado.
 * Agrega Content-Type: application/json solo si el body no es FormData.
 *
 * @param {any} body - Body de la request (puede ser FormData u objeto)
 * @returns {Object} Headers listos para fetch
 */
function buildHeaders(body) {
  const headers = {
    Authorization:     `Bearer ${localStorage.getItem("access_token")}`,
    "X-Acting-Role-Id": getCurrentRoleId(),
  };

  // FormData establece su propio Content-Type con boundary automáticamente.
  // Si se fuerza application/json, el servidor no puede parsear el multipart.
  if (!(body instanceof FormData) && body) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}


// ─── Funciones principales ────────────────────────────────────────────────────

/**
 * Función base para todas las requests HTTP (GET, POST, PATCH, DELETE).
 *
 * Características:
 * · Timeout de 8s via AbortController
 * · Retry automático si el backend responde not_authenticated (token expirado):
 *   llama a refreshToken() y reintenta la misma request una sola vez
 * · Manejo especial de errors como array de objetos (filas de importación):
 *   en ese caso usa baseMessage directamente en lugar de firstErrorMessage()
 * · Nunca lanza excepción: siempre resuelve con { ok, status, message, ... }
 *
 * Estructura de respuesta normalizada:
 * {
 *   ok:       boolean  → true solo si json.success === true && HTTP 2xx
 *   status:   number   → código HTTP (408 = timeout, 0 = red)
 *   message:  string   → mensaje principal para mostrar al usuario
 *   data:     any      → json.data (null si el backend no lo incluye)
 *   paginate: Array    → metadatos de paginación
 *   summary:  any      → resumen estadístico (asistencias, etc.)
 *   errors:   Array    → array crudo de errores (puede ser [{fila, errores},...])
 *   errorKey: string   → clave semántica para detectar tipo de error en el front
 * }
 *
 * @param {string} method   - Método HTTP: GET | POST | PATCH | DELETE
 * @param {string} endpoint - Ruta relativa sin slash inicial, ej: "apprentices/import"
 * @param {Object|FormData} [body] - Body de la request (opcional para GET/DELETE)
 * @returns {Promise<Object>} Respuesta normalizada, nunca lanza
 */
async function request(method, endpoint, body) {
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), TIMEOUT);

  // Encapsula el fetch para poder rehacerlo en el retry de token expirado
  const doFetch = () =>
    fetch(`${URL_BASE}/${endpoint}`, {
      method,
      credentials: "include",
      signal:      controller.signal,
      headers:     buildHeaders(body),
      body:        body
        ? (body instanceof FormData ? body : JSON.stringify(body))
        : undefined,
    });

  try {
    clearTimeout(timeoutId);

    let response = await doFetch();
    let json     = await parseJsonSafe(response);

    // ── Retry automático por token expirado ───────────────────────────────────
    // El backend responde { errorKey: "not_authenticated" } cuando el
    // access_token expiró. Se refresca el token y se reintenta la request.
    if (json?.errorKey === "not_authenticated") {
      await refreshToken();
      const retryResponse = await doFetch();
      json     = await parseJsonSafe(retryResponse);
      response = retryResponse;
    }

    // ── Normalización de errores ──────────────────────────────────────────────
    const errorsRaw = json?.errors ?? [];
    const errorsArr = Array.isArray(errorsRaw) ? errorsRaw : [];
    const baseMessage = json?.message ?? "";

    // Si errors es un array de objetos (ej: [{fila, errores, valores}] de importación),
    // firstErrorMessage devolvería "[object Object]". Se usa baseMessage directamente.
    const errorsAreObjects =
      errorsArr.length > 0 &&
      typeof errorsArr[0] === "object" &&
      errorsArr[0] !== null;

    const firstErr = errorsAreObjects ? "" : firstErrorMessage(errorsRaw);

    // Prioridad del mensaje final:
    // 1. Primer error de validación específico (si no son objetos)
    // 2. Mensaje general del backend
    const finalMessage =
      json?.success === false && firstErr ? firstErr : baseMessage;

    return {
      ok:       Boolean(json?.success) && response.ok,
      status:   response.status,
      message:  finalMessage,
      data:     json?.data     ?? null,
      paginate: json?.paginate ?? [],
      summary:  json?.summary  ?? null,
      errors:   errorsArr,
      errorKey: json?.errorKey ?? null,
    };

  } catch (err) {
    clearTimeout(timeoutId);

    // ── Timeout (AbortController disparado) ──────────────────────────────────
    if (err.name === "AbortError") {
      return {
        ok:       false,
        status:   408,
        message:  "La solicitud tardó demasiado (timeout)",
        data:     null,
        paginate: [],
        summary:  null,
        errors:   ["Timeout de 8 segundos"],
        errorKey: "timeout",
      };
    }

    // ── Error de red (sin conexión, DNS, CORS, etc.) ──────────────────────────
    return {
      ok:       false,
      status:   0,
      message:  "Error de conexión",
      data:     null,
      paginate: [],
      summary:  null,
      errors:   [err.message],
      errorKey: "network_error",
    };
  }
}

/**
 * Descarga un archivo binario desde el backend (Excel, PDF, etc.).
 *
 * A diferencia de request(), esta función:
 * · Espera una respuesta binaria (blob), no JSON
 * · Retry manual por 401 Unauthorized (token expirado)
 * · No normaliza JSON porque la respuesta exitosa es el archivo mismo
 * · En caso de error HTTP, retorna { ok: false } sin el blob
 *
 * Uso típico:
 *   const res = await api.downloadFile("apprentices/import/errors-excel");
 *   if (!res.ok) { error(res.message); return; }
 *   // res.blob contiene el archivo listo para crear URL temporal
 *
 * @param {string} endpoint - Ruta relativa, ej: "apprentices/import/errors-excel"
 * @returns {Promise<{ ok: boolean, blob: Blob|null, message: string }>}
 */
async function downloadFile(endpoint) {
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), TIMEOUT);

  const doFetch = () =>
    fetch(`${URL_BASE}/${endpoint}`, {
      method:      "GET",
      credentials: "include",
      signal:      controller.signal,
      headers: {
        Authorization:     `Bearer ${localStorage.getItem("access_token")}`,
        "X-Acting-Role-Id": getCurrentRoleId(),
        // Le indica al backend que esperamos un archivo Excel
        Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });

  try {
    clearTimeout(timeoutId);
    let response = await doFetch();

    // ── Retry por token expirado (401) ────────────────────────────────────────
    // downloadFile no usa parseJsonSafe porque la respuesta exitosa es binaria.
    // Se detecta el 401 directamente por status code.
    if (response.status === 401) {
      await refreshToken();
      response = await doFetch();
    }

    // ── Error HTTP (404 caché expirado, 403 sin permiso, etc.) ───────────────
    if (!response.ok) {
      return { ok: false, blob: null, message: "Error al descargar el archivo" };
    }

    // ── Éxito: retorna el blob para que el caller cree la URL temporal ────────
    const blob = await response.blob();
    return { ok: true, blob, message: "Archivo descargado correctamente" };

  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === "AbortError") {
      return { ok: false, blob: null, message: "La descarga tardó demasiado (timeout)" };
    }

    return { ok: false, blob: null, message: "Error de conexión al descargar" };
  }
}


// ─── API pública ──────────────────────────────────────────────────────────────

/**
 * Cliente HTTP centralizado para todas las peticiones al backend.
 *
 * Todos los métodos retornan una promesa que NUNCA lanza excepción.
 * Siempre resuelven con un objeto normalizado { ok, status, message, ... }.
 *
 * Uso:
 *   const res = await api.get("apprentices");
 *   const res = await api.post("apprentices/import", formData);
 *   const res = await api.patch("users/1", { name: "Juan" });
 *   const res = await api.delete("apprentices/1");
 *   const res = await api.downloadFile("apprentices/import/errors-excel");
 */
export const api = {
  get:          (endpoint)       => request("GET",    endpoint),
  post:         (endpoint, body) => request("POST",   endpoint, body),
  patch:        (endpoint, body) => request("PATCH",  endpoint, body),
  delete:       (endpoint)       => request("DELETE", endpoint),
  downloadFile: (endpoint)       => downloadFile(endpoint),
};

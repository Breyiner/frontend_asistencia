import { getCurrentRoleId } from "../utils/auth";
import { getCookie } from "../utils/getCookies";
import { refreshToken } from "./authTokens";

const urlBase = "http://localhost:8000/api";
const TIMEOUT = 8000;

async function parseJsonSafe(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function firstErrorMessage(errors) {
  if (!errors) return "";

  if (Array.isArray(errors) && errors.length > 0) {
    return String(errors[0] ?? "");
  }

  // fallback si algún endpoint devuelve objeto tipo { field: ["msg"] }
  if (typeof errors === "object") {
    const keys = Object.keys(errors);
    if (keys.length === 0) return "";
    const v = errors[keys[0]];
    if (Array.isArray(v) && v.length > 0) return String(v[0] ?? "");
  }

  return "";
}

async function request(method, endpoint, body) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

  console.log(getCurrentRoleId());

  const doFetch = () => {
    const headers = {
      Authorization: `Bearer ${getCookie("access_token")}`,
      "X-Acting-Role-Id": getCurrentRoleId(),
    };

    const isFormData = body instanceof FormData;

    if (!isFormData && body) {
      headers["Content-Type"] = "application/json";
    }

    return fetch(`${urlBase}/${endpoint}`, {
      method,
      credentials: "include",
      signal: controller.signal,
      headers,
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    });
  };

  try {
    clearTimeout(timeoutId);

    let response = await doFetch();
    let json = await parseJsonSafe(response);

    // Refresh token UNA SOLA VEZ
    if (json?.errorKey === "not_authenticated") {
      await refreshToken();
      const retryResponse = await doFetch();
      json = await parseJsonSafe(retryResponse);
      response = retryResponse;
    }

    const errorsRaw = json?.errors ?? [];
    const errorsArr = Array.isArray(errorsRaw) ? errorsRaw : [];
    const firstErr = firstErrorMessage(errorsRaw);

    const baseMessage = json?.message ?? "";
    const finalMessage =
      json?.success === false && firstErr ? firstErr : baseMessage;

    return {
      ok: Boolean(json?.success) && response.ok,
      status: response.status,
      message: finalMessage,
      data: json?.data ?? null,
      paginate: json?.paginate ?? [],
      summary: json?.summary ?? null,
      errors: errorsArr,
      errorKey: json?.errorKey ?? null,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      return {
        ok: false,
        status: 408,
        message: "La solicitud tardó demasiado (timeout)",
        data: null,
        paginate: [],
        summary: null,
        errors: ["Timeout de 8 segundos"],
        errorKey: "timeout",
      };
    }

    return {
      ok: false,
      status: 0,
      message: "Error de conexión",
      data: null,
      paginate: [],
      summary: null,
      errors: [error.message],
      errorKey: "network_error",
    };
  }
}

async function downloadFile(endpoint) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

  const doFetch = () =>
    fetch(`${urlBase}/${endpoint}`, {
      method: "GET",
      credentials: "include",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${getCookie("access_token")}`,
        "X-Acting-Role-Id": getCurrentRoleId(),
        Accept:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });

  try {
    clearTimeout(timeoutId);
    let response = await doFetch();

    if (response.status === 401) {
      await refreshToken();
      response = await doFetch();
    }

    if (!response.ok) {
      return {
        ok: false,
        message: "Error al descargar el archivo",
        blob: null,
      };
    }

    const blob = await response.blob();

    return {
      ok: true,
      blob,
      message: "Archivo descargado correctamente",
    };
  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      return {
        ok: false,
        message: "La descarga tardó demasiado (timeout)",
        blob: null,
      };
    }

    return {
      ok: false,
      message: "Error de conexión al descargar",
      blob: null,
    };
  }
}

export const api = {
  delete: (endpoint) => request("DELETE", endpoint),
  post: (endpoint, body) => request("POST", endpoint, body),
  patch: (endpoint, body) => request("PATCH", endpoint, body),
  get: (endpoint) => request("GET", endpoint),
  downloadFile: (endpoint) => downloadFile(endpoint),
};
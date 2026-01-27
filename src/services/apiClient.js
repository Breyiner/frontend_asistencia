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

async function request(method, endpoint, body) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);  

  const doFetch = () =>
    fetch(`${urlBase}/${endpoint}`, {
      method,
      credentials: "include",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie("access_token")}`,
        "X-Acting-Role-Id": getCurrentRoleId(),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

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

    return {
      ok: Boolean(json?.success) && response.ok,
      status: response.status,
      message: json?.message ?? "",
      data: json?.data ?? null,
      paginate: json?.paginate ?? [],
      summary: json?.summary ?? null,
      errors: json?.errors ?? [],
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

export const api = {
  delete: (endpoint) => request("DELETE", endpoint),
  post: (endpoint, body) => request("POST", endpoint, body),
  patch: (endpoint, body) => request("PATCH", endpoint, body),
  get: (endpoint) => request("GET", endpoint),
};
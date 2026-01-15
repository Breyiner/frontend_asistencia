import { getCookie } from "../utils/getCookies";
import { refreshToken } from "./authTokens";

const urlBase = "http://localhost:8000/api";

async function parseJsonSafe(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function request(method, endpoint, body) {
  const doFetch = () =>
    fetch(`${urlBase}/${endpoint}`, {
      method,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getCookie("access_token")}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

  let response = await doFetch();

  let json = await parseJsonSafe(response);

  if (json && json.errorKey === "not_authenticated") {
    await refreshToken();
    response = await doFetch();
    json = await parseJsonSafe(response);
  }

  return {
    ok: Boolean(json?.success) && response.ok,
    status: response.status,
    message: json?.message ?? "",
    data: json?.data ?? null,
    paginate: json?.paginate ?? [],
    errors: json?.errors ?? [],
    errorKey: json?.errorKey ?? null,
  };
}

export const api = {
  delete: (endpoint) => request("DELETE", endpoint),
  post: (endpoint, body) => request("POST", endpoint, body),
  patch: (endpoint, body) => request("PATCH", endpoint, body),
  get: (endpoint) => request("GET", endpoint),
};

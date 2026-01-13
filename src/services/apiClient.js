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

  if (response.status === 401) {
    await refreshToken();
    response = await doFetch();
  }

  const json = await parseJsonSafe(response);

  return {
    ok: Boolean(json.success) && response.ok,
    status: response.status,
    message: json?.message ?? "",
    data: json?.data ?? null,
    errors: json?.errors ?? [],
    errorKey: json?.errorKey ?? null,
  };
}

export const api = {
  post: (endpoint, body) => request("POST", endpoint, body),
  get: (endpoint) => request("GET", endpoint),
};
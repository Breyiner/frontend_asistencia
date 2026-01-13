import { getCookie } from "../utils/getCookies";

const urlBase = "http://localhost:8000/api";

export async function refreshToken() {
  await fetch(`${urlBase}/refresh_token`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getCookie("refresh_token")}`,
    },
    body: JSON.stringify([]),
  });
}
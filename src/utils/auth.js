import { getCookie } from "./getCookies";

const KEYS = {
  token: "access_token",
  refreshToken: "refresh_token",
  permissions: "permissions",
  roles: "roles",
  userId: "user_id",
};

export function getToken() {
  return getCookie(KEYS.token) || "";
}

export function isAuth() {
  return Boolean(getToken());
}

export function isAdmin() {
  const roles = localStorage.getItem(KEYS.roles);
  return roles.includes(1);
}

export function getPermissions() {
  try {
    const data = localStorage.getItem(KEYS.permissions);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function can(permission) {
  return getPermissions().includes(permission);
}

export function setSession({ userId, roles, permissions = [] }) {
  if (userId != null) localStorage.setItem(KEYS.userId, String(userId));
  if (roles != null) localStorage.setItem(KEYS.roles, String(roles));
  localStorage.setItem(KEYS.permissions, JSON.stringify(permissions));
}

export function clearSession() {
  Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
}
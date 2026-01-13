import { getCookie } from "./getCookies";

const KEYS = {
  token: "access_token",
  refreshToken: "refresh_token",
  user: "user_data",
  currentRoleId: "current_role_id",
  permissions: "permissions",
};

export function getToken() {
  return getCookie(KEYS.token) || "";
}

export function isAuth() {
  return Boolean(getToken());
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.user) || "null");
  } catch {
    return null;
  }
}

export function setSession({ user }) {
  
  localStorage.setItem(KEYS.user, JSON.stringify(user));
  
  localStorage.setItem(KEYS.currentRoleId, String(user.roles[0].id || 0));
}

export function getCurrentRoleId() {
  return localStorage.getItem(KEYS.currentRoleId) || "0";
}

export function setCurrentRole(roleId) {
  localStorage.setItem(KEYS.currentRoleId, String(roleId));
}

export function getCurrentRole() {
  const user = getUser();
  const roleId = parseInt(getCurrentRoleId());
  return user.roles.find(role => role.id === roleId) || user.roles[0];
}

export function getCurrentPermissions() {
  const role = getCurrentRole();
  return role.permissions || [];
}

export function can(permission) {
  return getCurrentPermissions().includes(permission);
}

export function getAllPermissions() {
  const user = getUser();
  return user.roles.flatMap(role => role.permissions || []);
}

export function isRole(roleName) {
  return getCurrentRole().name === roleName;
}

export function clearSession() {
  Object.values(KEYS).forEach(key => localStorage.removeItem(key));
  document.cookie = `${KEYS.token}=; path=/; max-age=0`;
  document.cookie = `${KEYS.refreshToken}=; path=/; max-age=0`;
}
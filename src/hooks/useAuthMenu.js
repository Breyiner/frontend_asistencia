import { RiDashboardLine, RiUser3Line, RiFolderLine, RiBookLine } from "@remixicon/react";
import { can, isRole } from "../utils/auth";

export function useAuthMenu() {
  const items = [
    { to: "/home", icon: RiDashboardLine, label: "Dashboard" }
  ];

  if (isRole("Administrador")) {
    if (can("users.viewAny")) {
      items.push({ to: "/users", icon: RiUser3Line, label: "Usuarios" });
    }

    if(can("apprentices.viewAny")) {
      items.push({ to: "/apprentices", icon: RiUser3Line, label: "Aprendices" });
    }

    if(can("training_programs.viewAny")) {
      items.push({ to: "/training_programs", icon: RiFolderLine, label: "Programas" });
    }

    if(can("fichas.viewAny")) {
      items.push({ to: "/fichas", icon: RiFolderLine, label: "Fichas" });
    }

    if(can("real_classes.viewAny")) {
      items.push({ to: "/real_classes", icon: RiFolderLine, label: "Clases Reales" });
    }

  }

  return items;
}
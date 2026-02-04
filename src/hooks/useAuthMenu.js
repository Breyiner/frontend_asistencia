import { RiDashboardLine, RiUser3Line, RiFolderLine, RiBookLine } from "@remixicon/react";
import { can, isRoleCode } from "../utils/auth";

export function useAuthMenu() {
  const items = [
    { to: "/home", icon: RiDashboardLine, label: "Dashboard" }
  ];

  if (isRoleCode("ADMIN")) {
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

    if(can("no_class_days.viewAny")) {
      items.push({ to: "/no_class_days", icon: RiFolderLine, label: "Días Sín Clase" });
    }
  }

  if (isRoleCode("COORDINADOR")) {
    
    if(can("apprentices.viewAny")) {
      items.push({ to: "/apprentices", icon: RiUser3Line, label: "Aprendices" });
    }

    if(can("training_programs.viewAny")) {
      items.push({ to: "/training_programs", icon: RiFolderLine, label: "Mis Programas" });
    }

    if(can("fichas.viewAny")) {
      items.push({ to: "/fichas", icon: RiFolderLine, label: "Fichas" });
    }

    if(can("real_classes.viewAny")) {
      items.push({ to: "/real_classes", icon: RiFolderLine, label: "Clases Reales" });
    }
  }

  if (isRoleCode("GESTOR_FICHAS")) {

    if(can("apprentices.viewAny")) {
      items.push({ to: "/apprentices", icon: RiUser3Line, label: "Aprendices" });
    }

    if(can("fichas.viewAny")) {
      items.push({ to: "/fichas", icon: RiFolderLine, label: "Mis Fichas" });
    }

    if(can("real_classes.viewManaged")) {
      items.push({ to: "/real_classes", icon: RiFolderLine, label: "Clases Reales" });
    }
  }
  
  if (isRoleCode("INSTRUCTOR")) {

    if(can("apprentices.viewAny")) {
      items.push({ to: "/apprentices", icon: RiUser3Line, label: "Aprendices" });
    }

    if(can("fichas.viewAny")) {
      items.push({ to: "/fichas", icon: RiFolderLine, label: "Fichas" });
    }

    if(can("real_classes.viewOwn")) {
      items.push({ to: "/real_classes", icon: RiFolderLine, label: "Mis Clases" });
    }
  }

  return items;
}
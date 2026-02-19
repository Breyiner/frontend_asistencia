import {
  RiDashboardLine,
  RiUser3Line,
  RiFolderLine,
  RiBookLine,
} from "@remixicon/react"; // Íconos del menú
import { can, isRoleCode } from "../utils/auth"; // Utilidades de autorización centralizadas

/**
 * Hook que construye el **menú de navegación dinámico** basado en:
 * 1. **Rol actual del usuario** (isRoleCode)
 * 2. **Permisos granulares** (can("recurso.accion"))
 *
 * **Ventajas:**
 * - Lógica de autorización centralizada
 * - Sin duplicación en múltiples componentes
 * - Fácil agregar nuevos roles/permisos
 * - Menú siempre actualizado con el estado de auth
 *
 * **Estructura de ítems:**
 * { to: "/ruta", icon: ComponenteIcono, label: "Texto visible" }
 *
 * [DESCRIPCIÓN COMPLETA EN EL BLOQUE JSDOC ARRIBA]
 */
export function useAuthMenu() {
  /**
   * Ítems **siempre visibles** para cualquier usuario autenticado.
   *
   * Dashboard es el "home" de la aplicación.
   */
  const items = [
    // Ruta principal de la app
    { to: "/home", icon: RiDashboardLine, label: "Dashboard" },
  ];

  /**
   * ========== ROL ADMIN ==========
   *
   * Puede ver prácticamente todo, pero cada sección tiene su permiso específico.
   *
   * `can("recurso.accion")` consulta permisos del usuario actual.
   */
  if (isRoleCode("ADMIN")) {
    // Gestión completa de usuarios del sistema
    if (can("users.viewAny")) {
      items.push({ to: "/users", icon: RiUser3Line, label: "Usuarios" });
    }

    // CRUD completo de aprendices
    if (can("apprentices.viewAny")) {
      items.push({
        to: "/apprentices",
        icon: RiUser3Line,
        label: "Aprendices",
      });
    }

    // Áreas organizacionales (agrupan programas)
    if (can("areas.viewAny")) {
      items.push({ to: "/areas", icon: RiFolderLine, label: "Areas" });
    }

    // Programas de formación (SENA)
    if (can("training_programs.viewAny")) {
      items.push({
        to: "/training_programs",
        icon: RiFolderLine,
        label: "Programas",
      });
    }

    // Fichas/grupos de aprendices
    if (can("fichas.viewAny")) {
      items.push({ to: "/fichas", icon: RiFolderLine, label: "Fichas" });
    }

    // Sesiones concretas de clase (con fecha/hora)
    if (can("real_classes.viewAny")) {
      items.push({
        to: "/real_classes",
        icon: RiFolderLine,
        label: "Clases Reales",
      });
    }

    // Días especiales sin clase (feriados, etc.)
    if (can("no_class_days.viewAny")) {
      items.push({
        to: "/no_class_days",
        icon: RiFolderLine,
        label: "Días Sín Clase",
      });
    }

    // Gestión de roles y permisos del sistema
    if (can("roles.viewAny")) {
      items.push({ to: "/roles", icon: RiFolderLine, label: "Roles" });
    }

    // Gestión de ambientes del sistema
    if (can("classrooms.viewAny")) {
      items.push({ to: "/classrooms", icon: RiFolderLine, label: "Ambientes" });
    }


    // Gestión de ambientes del sistema
    if (can("document_types.viewAny")) {
      items.push({ to: "/document_types", icon: RiFolderLine, label: "Tipos Documento" });
    }
  }

  /**
   * ========== ROL COORDINADOR ==========
   *
   * Enfocado en coordinación académica.
   *
   * Nota: "Mis Programas" → solo programas asignados a este coordinador.
   */
  if (isRoleCode("COORDINADOR")) {
    // Aprendices de sus programas/fichas
    if (can("apprentices.viewAny")) {
      items.push({
        to: "/apprentices",
        icon: RiUser3Line,
        label: "Aprendices",
      });
    }

    // Programas asignados a este coordinador
    if (can("training_programs.viewAny")) {
      items.push({
        to: "/training_programs",
        icon: RiFolderLine,
        label: "Mis Programas",
      });
    }

    // Fichas de sus programas
    if (can("fichas.viewAny")) {
      items.push({ to: "/fichas", icon: RiFolderLine, label: "Fichas" });
    }

    // Clases reales de sus fichas/programas
    if (can("real_classes.viewAny")) {
      items.push({
        to: "/real_classes",
        icon: RiFolderLine,
        label: "Clases Reales",
      });
    }

    // Días especiales sin clase (feriados, etc.)
    if (can("no_class_days.viewAny")) {
      items.push({
        to: "/no_class_days",
        icon: RiFolderLine,
        label: "Días Sín Clase",
      });
    }
  }

  /**
   * ========== ROL GESTOR_FICHAS ==========
   *
   * Gestión operativa de fichas específicas asignadas.
   */
  if (isRoleCode("GESTOR_FICHAS")) {
    // Aprendices de sus fichas asignadas
    if (can("apprentices.viewAny")) {
      items.push({
        to: "/apprentices",
        icon: RiUser3Line,
        label: "Aprendices",
      });
    }

    // Fichas específicamente asignadas a este gestor
    if (can("fichas.viewAny")) {
      items.push({ to: "/fichas", icon: RiFolderLine, label: "Mis Fichas" });
    }

    // Clases reales que este gestor puede administrar
    if (can("real_classes.viewManaged")) {
      items.push({
        to: "/real_classes",
        icon: RiFolderLine,
        label: "Clases Reales",
      });
    }

    // Días especiales sin clase (feriados, etc.)
    if (can("no_class_days.viewAny")) {
      items.push({
        to: "/no_class_days",
        icon: RiFolderLine,
        label: "Días Sín Clase",
      });
    }
  }

  /**
   * ========== ROL INSTRUCTOR ==========
   *
   * Vista limitada a sus responsabilidades docentes.
   */
  if (isRoleCode("INSTRUCTOR")) {
    // Aprendices de sus clases/fichas
    if (can("apprentices.viewAny")) {
      items.push({
        to: "/apprentices",
        icon: RiUser3Line,
        label: "Aprendices",
      });
    }

    // Fichas donde imparte clases
    if (can("fichas.viewAny")) {
      items.push({ to: "/fichas", icon: RiFolderLine, label: "Fichas" });
    }

    // SOLO sus clases reales (donde es instructor)
    if (can("real_classes.viewOwn")) {
      items.push({
        to: "/real_classes",
        icon: RiFolderLine,
        label: "Mis Clases",
      });
    }
  }

  /**
   * Retorna array FINAL de ítems de menú autorizados.
   *
   * ✅ Orden preservado (dashboard primero, luego por rol)
   * ✅ Solo ítems con permisos
   * ✅ Listo para map() en NavLink o similar
   */
  return items;
}

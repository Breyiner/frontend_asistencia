import DataListLayout from "../../components/DataList/DataListLayout";
import "../../components/Badge/Badge.css";
import useCatalog from "../../hooks/useCatalog";
import { can, getCurrentRoleCode } from "../../utils/auth";
import BadgesCompact from "../../components/BadgesCompact/BadgesCompact";

/**
 * Página principal de listado de clases reales.
 * 
 * Muestra una tabla filtrable y paginada de clases reales según el rol del usuario:
 * - ADMIN: Todas las clases del sistema
 * - GESTOR_FICHAS: Solo clases de sus fichas
 * - INSTRUCTOR: Solo sus clases asignadas
 * 
 * Incluye filtros avanzados, creación condicional y navegación a detalle.
 * 
 * @returns {JSX.Element} Layout completo con filtros, tabla y paginación
 */
export default function RealClassesListPage() {
  // 🔐 Obtiene código del rol actual del usuario autenticado
  const roleCode = getCurrentRoleCode();
  
  // 🎭 Determina permisos y vistas según rol del usuario
  const isAdmin = roleCode === "ADMIN";           // Admin ve TODO
  const isGestor = roleCode === "GESTOR_FICHAS";  // Gestor ve SUS fichas
  const isInstructor = roleCode === "INSTRUCTOR"; // Instructor ve SUS clases

  /**
   * Endpoint dinámico según rol del usuario.
   * 
   * Cada rol tiene su endpoint específico en la API:
   * - ADMIN → /api/real_classes (todas)
   * - GESTOR_FICHAS → /api/real_classes/managed (fichas asignadas)
   * - INSTRUCTOR → /api/real_classes/mine (solo las suyas)
   */
  const endpoint = isAdmin
    ? "real_classes"                    // ✅ Todas las clases
    : isGestor
      ? "real_classes/managed"          // ✅ Solo sus fichas
      : "real_classes/mine";            // ✅ Solo sus clases

  /**
   * Título contextual dinámico según rol.
   * 
   * Personaliza la UX mostrando contexto relevante para cada usuario.
   */
  const title = isAdmin
    ? "Listado de Clases"                 // Vista completa
    : isGestor
      ? "Clases de mis fichas"           // Fichas asignadas
      : "Mis clases";                    // Solo las suyas

  /**
   * Verifica permiso de creación según políticas Spatie.
   * 
   * Determina si mostrar botón "Crear Nueva Clase".
   */
  const canCreate = can("real_classes.create");

  // 📚 Catálogos para filtros (se cargan en paralelo)
  const instructorsCatalog = useCatalog("users/role/3");     // Instructores (role_id=3)
  const fichasCatalog = useCatalog("fichas/select");         // Fichas disponibles
  const programsCatalog = useCatalog("training_programs/select"); // Programas formativos
  const termsCatalog = useCatalog("terms");                  // Trimestres

  /**
   * Configuración completa de filtros dinámicos.
   * 
   * Filtros base + condicionales según rol:
   * ✅ SIEMPRE: fecha, ficha, programa
   * ✅ ADMIN/GESTOR: + trimestre
   * ✅ ADMIN/GESTOR: + instructor
   */
  const filtersConfig = [
    // 📅 Filtro por fecha de clase (siempre visible)
    {
      name: "date",
      label: "Fecha",
      type: "date",
      defaultValue: "",
    },
    
    // 🆔 Filtro por ficha (siempre visible)
    {
      name: "ficha_id",
      label: "Ficha",
      type: "select",
      defaultValue: "",
      options: fichasCatalog.options,    // Opciones reactivas del catálogo
      // advanced: true,                // Desactivado temporalmente
    },
    
    // 🎓 Filtro por programa (siempre visible, avanzado)
    {
      name: "training_program_id",
      label: "Programa de Formación",
      type: "select",
      defaultValue: "",
      options: programsCatalog.options,  // Opciones reactivas
      advanced: true,                    // Oculto por defecto
    },

    // 👨‍🏫 Filtro Instructor (SOLO Admin/Gestor, NO Instructor)
    ...(!isInstructor
      ? [
          {
            name: "instructor_id",
            label: "Instructor",
            type: "select",
            defaultValue: "",
            options: instructorsCatalog.options,  // Solo instructores
          },
        ]
      : []),  // Instructors NO filtran por instructor (verían solo ellos)

    // 📚 Filtro Trimestre (SOLO Admin/Gestor)
    ...(isAdmin || isGestor
      ? [
          {
            name: "term_id",
            label: "Trimestre",
            type: "select",
            defaultValue: "",
            options: termsCatalog.options,    // Trimestres disponibles
            advanced: true,                   // Oculto por defecto
          },
        ]
      : []),  // Instructors NO ven trimestres
  ];

  // 🎨 Render final: Layout genérico con toda la config
  return (
    <DataListLayout
      title={title}                           // Título dinámico por rol
      endpoint={endpoint}                     // API endpoint por rol
      createPath={canCreate ? "/real_classes/create" : null}  // Botón crear condicional
      initialFilters={{ per_page: 10 }}       // Paginación inicial (10 por página)
      
      /** 
       * Navegación al detalle de clase al clickear fila.
       * 
       * Transforma fila → `/real_classes/${row.id}`
       * Útil para navegación directa desde tabla.
       */
      rowClickPath={(r) => `/real_classes/${r.id}`}
      
      filtersConfig={filtersConfig}           // Filtros configurados arriba
      
      /** 
       * Columnas de la tabla con renderizado personalizado.
       * 
       * Cada columna puede tener render() para formato especial.
       */
      tableColumns={[
        // 📅 Columna fecha (texto plano)
        { key: "class_date", label: "Fecha" },

        // ⏰ Columna horario (formateado HH:MM)
        {
          key: "schedule",
          label: "Horario",
          render: (row) => (
            <span>
              {row.start_hour?.slice(0, 5)} - {row.end_hour?.slice(0, 5)}
              {/* Extrae HH:MM de "HH:MM:SS" */}
            </span>
          ),
        },

        // 🆔 Columna ficha (texto plano)
        { key: "ficha_number", label: "Ficha" },
        
        // 🎓 Columna programa (texto plano)
        { key: "training_program_name", label: "Programa" },

        // 📚 Columna trimestre (badge púrpura)
        {
          key: "term_name",
          label: "Trimestre",
          render: (row) => (
            <BadgesCompact
              items={[row.term_name || "Sin trimestre"]}  // Fallback si null
              maxVisible={1}                            // Máximo 1 badge visible
              badgeClassName="badge badge--purple"      // Estilo púrpura
            />
          ),
        },
        
        // 👨‍🏫 Columna instructor (texto plano con fallback)
        {
          key: "instructor_name",
          label: "Instructor",
          render: (row) => (
            <span>{row.instructor_name || "Sin instructor"}</span>
          ),
        },

        // 📊 Columna ratio asistencias (badge verde)
        {
          key: "attendance_ratio",
          label: "Asistencias",
          render: (row) => (
            <BadgesCompact
              items={[row.attendance_ratio ?? "0/0"]}  // "presentes/totales"
              maxVisible={1}
              badgeClassName="badge badge--green"     // Estilo verde
            />
          ),
        },
      ]}
    />
  );
}

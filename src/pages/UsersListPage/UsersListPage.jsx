// Componente genérico de layout de tablas paginadas
import DataListLayout from "../../components/DataList/DataListLayout"; // Tabla reutilizable completa

// Estilos requeridos para badges en columnas render
import "../../components/Badge/Badge.css"; // CSS global de badges

// Componente para mostrar múltiples badges compactos
import BadgesCompact from "../../components/BadgesCompact/BadgesCompact"; // Renderiza listas como badges

/**
 * Página de listado completo de usuarios del sistema.
 * 
 * Tabla paginada avanzada con 6 filtros y 8 columnas especializadas.
 * **Única página** con renderizado de badges dinámicos por columna.
 * 
 * **Filtros (6 totales)**:
 * - Básicos: Nombres, Apellidos (siempre visibles)
 * - Avanzados: Documento, Email, Rol, Estado (colapsables)
 * 
 * **Columnas con render especial (3/8)**:
 * 1. Áreas: badges marrones (max 1 visible + overflow)
 * 2. Roles: badges morados (max 1 visible + overflow)  
 * 3. Estado: badge verde/marrón dinámico según "Activo"/inactivo
 * 
 * Características:
 * - Paginación server-side (10 usuarios/página)
 * - Click fila → detalle usuario
 * - Botón crear siempre visible
 * - Filtros persisten en URL
 * 
 * @component
 * @returns {JSX.Element} Tabla avanzada de usuarios con badges contextuales
 */
export default function UsersListPage() {
  // Render único: DataListLayout completamente configurado
  return (
    <DataListLayout
      title="Listado de Usuarios"                           // Título correcto y consistente
      endpoint="users"                                     // API endpoint principal
      createPath="/users/create"                           // Ruta de creación directa
      initialFilters={{ per_page: 10 }}                    // Paginación inicial estándar
      rowClickPath={(u) => `/users/${u.id}`}               // Navegación a detalle por ID

      // Configuración de 6 filtros (2 básicos + 4 avanzados)
      filtersConfig={[
        {
          name: "first_name",           // Campo backend: primer nombre
          label: "Nombres",             // Etiqueta para usuario
          placeholder: "Nombres",       // Hint en input vacío
          defaultValue: "",             // Valor inicial
          withSearchIcon: true,         // Icono lupa visible
        },
        {
          name: "last_name",            // Campo backend: apellido
          label: "Apellidos",
          placeholder: "Apellidos",
          defaultValue: "",
          // Sin icono (filtro secundario)
        },
        {
          name: "document_number",      // Búsqueda por documento
          label: "Número de documento",
          placeholder: "Número de documento",
          advanced: true,               // Filtro colapsable (avanzado)
        },
        {
          name: "email",                // Búsqueda email exacta
          label: "Correo",
          placeholder: "Correo electrónico",
          advanced: true,
        },
        {
          name: "role_name",            // Filtra por nombre de rol
          label: "Rol",
          placeholder: "Rol",
          advanced: true,
        },
        {
          name: "status_name",          // Filtra por estado textual
          label: "Estado",
          placeholder: "Estado",
          advanced: true,
        },
      ]}

      // 8 columnas con 3 renders personalizados usando BadgesCompact
      tableColumns={[
        { key: "document_number", label: "Documento" },           // Columna 1: ID único
        { key: "first_name", label: "Nombres" },                  // Columna 2: Primer nombre
        { key: "last_name", label: "Apellidos" },                 // Columna 3: Apellidos
        
        { key: "email", label: "Correo" },                        // Columna 4: Email completo
        
        {
          key: "areas",                                           // Columna 5: Múltiples áreas
          label: "Áreas",
          render: (u) => (
            <BadgesCompact
              items={u.areas}                                    // Array de objetos área
              maxVisible={1}                                     // Muestra SOLO 1 + overflow
              badgeClassName="badge badge--brown"                // Color marrón específico
              moreClassName="badge badge--fill-neutral"          // Overflow neutral
            />
          ),
        },
        {
          key: "roles",                                           // Columna 6: Múltiples roles
          label: "Roles",
          render: (u) => (
            <BadgesCompact
              items={u.roles}                                    // Array de objetos rol
              maxVisible={1}                                     // SOLO 1 visible + resto
              badgeClassName="badge badge--purple"               // Morado distintivo
              moreClassName="badge badge--fill-neutral"          // Overflow neutral
            />
          ),
        },
        {
          key: "status",                                          // Columna 7: Estado dinámico
          label: "Estado",
          render: (u) => (
            <BadgesCompact
              items={[u.status]}                                  // Array de UNO (texto plano)
              maxVisible={1}                                     // Siempre visible completo
              badgeClassName={`badge badge--${
                u.status === "Activo" ? "green" : "brown"         // Verde=Activo, Marrón=Inactivo
              }`}
            />
          ),
        },
      ]}
    />
  );
}
